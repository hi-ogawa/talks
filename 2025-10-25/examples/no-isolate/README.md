```sh
$ vitest

stdout | src/mul.test.ts
[shared.ts]

stdout | src/add.test.ts
[shared.ts]

 ✓ src/mul.test.ts (1 test) 1ms
 ✓ src/add.test.ts (2 tests) 2ms

$ vitest --no-fileParallelism

stdout | src/mul.test.ts
[shared.ts]

 ✓ src/mul.test.ts (1 test) 1ms
 ✓ src/add.test.ts (2 tests) 2ms
```
