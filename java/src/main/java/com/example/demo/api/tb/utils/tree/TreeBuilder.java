package com.example.demo.api.tb.utils.tree;

import java.lang.reflect.Method;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

public class TreeBuilder {

    // 缓存已解析的方法，提升性能
    private static final Map<Class<?>, Method[]> METHOD_CACHE = new ConcurrentHashMap<>();

    public static <T> List<T> buildTree(
            List<T> list,
            Function<T, Long> idFunc,
            Function<T, Long> parentIdFunc) {

        if (list == null || list.isEmpty()) {
            return new ArrayList<>(0); // 统一返回 ArrayList 实例
        }

        Map<Long, T> nodeMap = new HashMap<>();
        Set<Long> duplicateIds = new HashSet<>();

        for (T item : list) {
            if (item == null) continue;
            Long id = idFunc.apply(item);
            if (id != null) {
                if (nodeMap.containsKey(id)) {
                    duplicateIds.add(id);
                } else {
                    nodeMap.put(id, item);
                }
            }
        }

        if (!duplicateIds.isEmpty()) {
            System.err.println("Warning: Duplicate IDs found in tree nodes: " + duplicateIds);
        }

        List<T> roots = new ArrayList<>();

        for (T item : list) {
            if (item == null) continue;
            Long parentId = parentIdFunc.apply(item);
            if (parentId == null || parentId == 0L) {
                roots.add(item);
            } else {
                T parent = nodeMap.get(parentId);
                if (parent != null) {
                    addChild(parent, item);
                }
            }
        }

        return roots;
    }

    @SuppressWarnings("unchecked")
    private static <T> void addChild(T parent, T child) {
        try {
            Class<?> clazz = parent.getClass();
            Method[] methods = METHOD_CACHE.computeIfAbsent(clazz, k -> {
                try {
                    Method getMethod = findAccessibleMethod(clazz, "getChildren");
                    Method setMethod = findAccessibleMethod(clazz, "setChildren", List.class);
                    return new Method[]{getMethod, setMethod};
                } catch (Exception ignored) {
                    return new Method[2]; // 占位符
                }
            });

            Method getChildrenMethod = methods[0];
            Method setChildrenMethod = methods[1];

            if (getChildrenMethod == null || setChildrenMethod == null) {
                throw new RuntimeException("Required methods 'getChildren' or 'setChildren' not found in class: " + clazz.getName());
            }

            List<T> children = (List<T>) getChildrenMethod.invoke(parent);
            if (children == null) {
                children = new ArrayList<>();
                setChildrenMethod.invoke(parent, children);
            }
            children.add(child);

        } catch (Exception e) {
            throw new RuntimeException(
                    String.format("Failed to add child to parent of type %s using reflection.",
                            parent != null ? parent.getClass().getName() : "null"), e);
        }
    }

    private static Method findAccessibleMethod(Class<?> clazz, String methodName, Class<?>... paramTypes) throws NoSuchMethodException {
        while (clazz != null) {
            try {
                Method method = clazz.getDeclaredMethod(methodName, paramTypes);
                method.setAccessible(true); // 提高兼容性和安全性
                return method;
            } catch (NoSuchMethodException e) {
                clazz = clazz.getSuperclass();
            }
        }
        return null;
    }
}
