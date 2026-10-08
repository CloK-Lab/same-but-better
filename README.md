# same-but-better

通过可运行的小案例、Lean 证明和性能实验，探索代码等价性与性能取舍。

同一个问题，不同的实现。我们从小案例出发，学习哪些代码具有相同的行为、
它们的成本有何不同，以及这些结论在什么条件下成立。

每个案例把实现、解释、证明和实验放在一起。算法、数据处理、前端交互都可以成为题材；
从一个讲清楚的例子开始，慢慢积累。

## 开始

安装 [Lean 工具链管理器 elan](https://github.com/leanprover/elan#installation) 后：

```sh
git clone https://github.com/CloK-Lab/same-but-better.git
cd same-but-better
lake build
lake exe demo
```

项目固定使用 **Lean 4.34.0**，目前只依赖 Lean 标准库。`lake build` 会编译实现、
检查证明并构建演示程序。也可以安装 VS Code 的 Lean 4 扩展，打开本目录逐步阅读证明。

## 案例

| 案例 | 等价性 | 成本结论 | 实际性能实验 |
| --- | --- | --- | --- |
| [两次 map 合并为一次](examples/map-fusion/README.md) | 已证明：所有有限列表、纯函数的结果相同 | 已证明：模型中的列表节点访问次数由 `2n` 降为 `n` | 尚未测量；`demo` 只展示成本计数 |

“更好”总是相对于某个指标和前提。一个版本可能更快，另一个更省内存；
某项优化也可能只在特定输入规模下有收益。案例应把这些差别写清楚。

## 怎么读一个案例

1. 看问题和两种实现。
2. 看等价性的范围：比较什么行为，输入和环境有什么前提。
3. 读 Lean 证明，以及形式化模型与实现的对应关系。
4. 看成本模型：统计哪些操作，哪些成本没有包括。
5. 如有性能基准测试，查看命令、输入、环境和原始结果。

**已证明、实测观察、尚待验证**会分别标注。操作次数的证明不等于真实机器上的耗时证明；
两个 Lean 模型等价，也不自动证明对应的外部语言程序等价。

## 目录

```text
SameButBetter/
  Cases/MapFusion/Basic.lean   # 两种实现、计数执行及证明
SameButBetter.lean            # 案例库入口
Main.lean                     # 可运行的成本计数演示
examples/map-fusion/README.md # 案例讲解
CONTRIBUTING.md               # 如何补充案例
```

## 一起补充

欢迎贡献一个小例子、一段更清楚的解释、一份证明、一个反例或可复现的性能实验。
不需要一次覆盖所有维度。见 [贡献说明](CONTRIBUTING.md)。
