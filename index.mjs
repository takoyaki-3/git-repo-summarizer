#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { summarizeCommand } from './commands/summarize.mjs';
import { mkdocCommand } from './commands/mkdoc.mjs';
import { readmeCommand } from './commands/readme.mjs';
import { geminiCommand } from './commands/gemini.mjs';

yargs(hideBin(process.argv))
  .command(summarizeCommand)
  .command(mkdocCommand)
  .command(readmeCommand)
  .command(geminiCommand)
  .help()
  .argv;
