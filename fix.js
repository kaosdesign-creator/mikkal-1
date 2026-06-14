const fs = require('fs')
const path = require('path')

const filePath = path.join('C:\\Users\\bthey\\downloads\\mikkal-v1\\mikkal\\components\\images\\ImagesInterface.tsx')

let content = fs.readFileSync(filePath, 'utf8')

content = content.replace(
  'export default function ImagesInterface({ userName }: { userName?: string })',
  'export default function ImagesInterface({ userName, isMobile }: { userName?: string; isMobile?: boolean })'
)

fs.writeFileSync(filePath, content, 'utf8')
console.log('Done! isMobile prop added.')