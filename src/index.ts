import * as yaml from 'yamljs';
import { GithubExtractor } from './github-extractor';
import { PRsProcessor } from './pr-processor';

const config = yaml.load('src/config.yml');
console.log(config)
const extractor = new GithubExtractor(config);
const processor = new PRsProcessor(extractor);

processor.processPRs();