import fs from "fs";
import { Blob } from "buffer";
import Htmlifier from '@sheeptester/htmlifier'

const trabalhoId = 6;

async function convert(file) {
    let buffer = fs.readFileSync(`sb3-files/${file}.sb3`);
    let blob = new Blob([buffer]);

    let html = await new Htmlifier({})
        .htmlify(
            {
                type: 'file',
                file: blob
            },
            //HtmlifyOptions
            {
                autoStart: false,
                includeVm: false,
                //LoadingOptions
                loading: {
                    progressBar: '#00ffff'
                },
                //ButtonOptions
                buttons: {
                    fullscreen: true,
                    startStop: true
                }
            },
        )
        .then(blob => blob.text());

    //troca para vm local
    html = html.replace('https://sheeptester.github.io/scratch-vm/16-9/vm.min.js', '../vm.min.js');

    await fs.writeFile(`html-files/${file}.html`, html, (err) => {
        if (err)
            return console.log(`Erro ao gravar arquivo (${file}): ${err}`);
    })
}

async function main(trabalhoId) {
    if (!fs.existsSync('sb3-files')) {
        fs.mkdirSync('sb3-files');
    }
    if (!fs.existsSync('html-files')) {
        fs.mkdirSync('html-files');
    }

    fs.readdir('sb3-files', function (err, files) {
        if (err) {
            return console.log('Erro ao ler arquivos: ' + err);
        }

        let inserts = "INSERT INTO `trabalho_aluno` (`trabalhoId`, `usuarioId`) VALUES";

        files.forEach((file) => {
            let splited = file.split('.');
            let format = splited.pop();
            if (format == 'sb3') {
                let alunoId = splited[0];
                convert(alunoId);
                inserts += `\n(${trabalhoId}, ${alunoId}),`
            }
        });

        console.log("\n\n" + inserts + "\n\n");
    });
}

main(trabalhoId);
