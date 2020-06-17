export interface TestCase<T>{
  name: string;
  params: T;
}

/** helper function allowing a test to parameterized in a set of testcases */
export function paramtest<T>(name: String, params: TestCase<T>[], testFactory: (param: T)=>()=>void, paramFormatter?: (param: TestCase<T>)=>string) {
    for(let param of params) {
      let paramStr = paramFormatter?paramFormatter(param):param.name;
      Deno.test(name+" ("+paramStr+")",
      testFactory(param.params));
    }
}
