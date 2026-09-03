const fs = require('fs');

let code = fs.readFileSync('src/data/merkleSeedData.ts', 'utf8');

code = code.replace("sender: 'Phan Tấn Long'", "sender: 'Alice'");
code = code.replace("receiver: 'Trịnh Thị Khánh Vy'", "receiver: 'Bob'");

code = code.replace("sender: 'CTK47B Academic Node'", "sender: 'Charlie'");
code = code.replace("receiver: 'Faculty Research Treasury'", "receiver: 'Dave'");

code = code.replace("sender: 'Student Lab Wallet'", "sender: 'Frank'");
code = code.replace("receiver: 'Peer Review Auditor'", "receiver: 'Grace'");

code = code.replace("sender: 'Dalat University Node'", "sender: 'Heidi'");
code = code.replace("receiver: 'Cryptography Seminar Pool'", "receiver: 'Ivan'");


code = code.replace("sender: 'Scientific Research Dept'", "sender: 'Alice'");
code = code.replace("receiver: 'Blockchain Research Archive'", "receiver: 'Charlie'");

code = code.replace("sender: 'Faculty Treasury'", "sender: 'Bob'");
code = code.replace("receiver: 'Student Scholarship Fund'", "receiver: 'Dave'");

code = code.replace("sender: 'Validator Node #04'", "sender: 'Frank'");
code = code.replace("receiver: 'Network Consensus Pool'", "receiver: 'Grace'");

code = code.replace("sender: 'Phan Tấn Long'", "sender: 'Heidi'");
code = code.replace("receiver: 'Peer Reviewer Node'", "receiver: 'Ivan'");

fs.writeFileSync('src/data/merkleSeedData.ts', code);
