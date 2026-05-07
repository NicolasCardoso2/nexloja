// Hook afterPack do electron-builder:
// emite o ícone correto no NexLoja.exe depois do empacotamento,
// mas antes do NSIS criar o instalador.
// Usa o rcedit-x64.exe diretamente (evita problemas de ESM import).

const path = require('path');
const { spawnSync } = require('child_process');

exports.default = async function afterPack(context) {
  if (process.platform !== 'win32') return;

  const exePath = path.join(context.appOutDir, 'NexLoja.exe');
  const iconPath = path.join(__dirname, '..', 'electron', 'assets', 'icon.ico');
  const rceditBin = path.join(__dirname, '..', 'node_modules', 'rcedit', 'bin', 'rcedit-x64.exe');

  console.log('  • embed-icon: embutindo ícone em', exePath);
  const result = spawnSync(rceditBin, [exePath, '--set-icon', iconPath], { encoding: 'utf8' });

  if (result.status !== 0) {
    console.error('  ⨯ embed-icon falhou:', result.stderr || result.error);
    throw new Error('rcedit falhou ao embutir ícone');
  }
  console.log('  • embed-icon: ícone embutido com sucesso');
};
