import * as fs from 'fs';
import * as yaml from 'js-yaml';

function go(filename: string) {
    const yamlText = fs.readFileSync(filename, 'utf8');
    const obj = yaml.safeLoad(yamlText);
    console.log(obj);
}

// go('d:\\git\\einstein\\src\\samples\\true_or_false\\suites\\simple.yaml');
go('d:\\git\\einstein\\src\\samples\\true_or_false\\suites\\domain.yaml');
