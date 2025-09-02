import { styleText } from 'node:util'

console.log(styleText(['dim'], '[wait]') + ' 4.1.2')
console.log(styleText(['dim', 'blue'], '[skip]') + ' 4.1.3')
console.log(styleText(['yellow'], '[load]') + ' 4.2.0')
console.log(styleText(['yellow'], '[test]') + ' 5.0.0')
console.log(styleText(['yellow'], '[save]') + ' 5.0.2')
console.log(styleText(['green'], '[pass]') + styleText(['green'], ' 5.0.3'))
console.log(styleText(['red'], '[fail]') + styleText(['red'], ' 3.5.0'))
console.log(styleText(['redBright', 'bgRed'], '[err!]') + ' 0.0.0')
