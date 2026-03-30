package com.example.demo.api;

import java.util.concurrent.CompletableFuture;

public class CompletableFutureExample {
    public static void main(String[] args) {
        // 异步执行多个方法并组合结果
        CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(() -> {
            return method1();
        });

        CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> {
            return method2();
        });

        // 组合结果
        CompletableFuture<Integer> combinedFuture = future1.thenCombine(future2, (result1, result2) -> {
            return result1 + result2; // 组合结果
        });

        // 获取最终结果
        Integer finalResult = combinedFuture.join();
        System.out.println("组合结果: " + finalResult);
    }

    private static int method1() {
        try {
            Thread.sleep(2000); // 模拟长时间运行的任务
            System.out.println("方法 1 执行完成");
            return 10; // 返回结果
        } catch (InterruptedException e) {
            e.printStackTrace();
            return 0;
        }
    }

    private static int method2() {
        try {
            Thread.sleep(3000); // 模拟长时间运行的任务
            System.out.println("方法 2 执行完成");
            return 20; // 返回结果
        } catch (InterruptedException e) {
            e.printStackTrace();
            return 0;
        }
    }
}