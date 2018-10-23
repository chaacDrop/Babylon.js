var through = require('through2');
var PluginError = require('gulp-util').PluginError;
let path = require('path');
let fs = require('fs');

let tsTemplate = 
`import { Effect } from "babylonjs";

let name = '##NAME_PLACEHOLDER##';
let shader = \`##SHADER_PLACEHOLDER##\`;

Effect.ShadersStore[name] = shader;

export { shader, name };
`;

function getShaderName(filename) {
    let parts = filename.split('.');
    if (parts[1] !== 'fx') {
        return parts[0] + (parts[1] === 'fragment' ? 'Pixel' : 'Vertex') + "Shader";
    } else {
        return parts[0];
    }
}

function main() {
    return through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }
            if (file.isStream()) {
                cb(new PluginError("Remove Shader Comments", "Streaming not supported."));
            }
    
            let filename = path.basename(file.path);
            let normalized = path.normalize(file.path);
            let directory = path.dirname(normalized);
            let shaderName = getShaderName(filename);
            let tsFilename = filename.replace('.fx', '.ts');
            let data = file.contents.toString();

            // Trailing whitespace...
            data = data.replace(/[^\S\r\n]+$/gm, "");

            let tsContent = tsTemplate.replace('##NAME_PLACEHOLDER##', shaderName);
            tsContent = tsContent.replace('##SHADER_PLACEHOLDER##', data);

            fs.writeFileSync(directory + '/' + tsFilename, tsContent);

            return cb();
        });
}

module.exports = main;