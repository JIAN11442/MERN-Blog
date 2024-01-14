const BlockConsole = (msg: string) => {
  const border = '-'.repeat(msg.length + 4);
  console.log(`\n${border}\n| ${msg} |\n${border}`);
};

export default BlockConsole;
