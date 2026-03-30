import rolster from '@rolster/rollup';

export default rolster({
  entryFiles: ['index'],
  packages: ['@angular/core', '@rolster/commons']
});
