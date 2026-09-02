import fs from 'fs';
let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

// The file currently has:
//          ) : (
//            <div className="w-full">
//            <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0D12] border border-slate-800 space-y-4">
// ...
//            </div>
//          )}
//
// Let's just fix it properly.

content = content.replace(
  /) : \(\n\s*<div className="w-full">\n\s*<div className="p-4/g,
  ') : (\n              <div className="p-4'
);

// If it wasn't caught by the above, let's just do a manual string replace:
content = content.replace(
  '<div className="w-full">\n            <div className="p-4',
  '<div className="p-4'
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
