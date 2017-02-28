/**
 * In this module implemented math functions 
 * in C progrmming language for WebOs calculator.
 * This source will be compiled in .wasm
 * for use in browser by WebAssembly teqnalogies
 */

/**
 * Returns a sum of two arguments.
 *
 * @param { int } a
 * @param { int } b
 * @return { int } sum of two arguments
 */
int add(int a, int b) {
  return a + b;
}

/**
 * Return a division of two arguments.
 *
 * @param { int } a
 * @param { int } b
 * @return { int } division of two arguments
 */
int dev(int a, int b) {
  return a / b;
}

/**
 * Return a subtraction of two arguments.
 *
 * @param { int } a
 * @param { int } b
 * @return { int } subtraction of two argument
 */
int sub(int a, int b) {
  return a - b;
}

/**
 * Return a multiplication of two arguments.
 *
 * @param { int } a
 * @param { int } b
 * @return { int } multiplication of two argument
 */
int mul(int a, int b) {
  return a * b;
}

/**
 * Return a nth element of fibonacci, using recursion with memoization.
 * 
 * @hash# { int[] } fins
 * @param { int } n
 * @return { int } nth element of fibonacci
 */
int fibs[10000];
 
int fib(int n) {
  if (n < 2) {
   return n;
  } else {
    if (fibs[n - 1] == 0) {
      fibs[n - 1] = fib(n - 1);
   }
   if (fibs[n - 2] == 0) {
     fibs[n - 2] = fib(n - 2);
    }
   return fibs[n - 2] + fibs[n - 1];
  }
}
