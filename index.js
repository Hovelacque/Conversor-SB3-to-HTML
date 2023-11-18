import fs from "fs";
import { Blob } from "buffer";
import Htmlifier from '@sheeptester/htmlifier'
import nodeHtmlToImage from 'node-html-to-image'

const trabalhoId = 6;

async function convertSb3ToHtml(file, autoStart, includeVm, showBtns) {
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
                autoStart: autoStart,
                includeVm: includeVm,
                //LoadingOptions
                loading: {
                    progressBar: '#00ffff'
                },
                //ButtonOptions
                buttons: {
                    fullscreen: showBtns,
                    startStop: showBtns
                }
            },
        )
        .then(blob => blob.text());


    //troca para vm local
    if (!includeVm)
        html = html.replace('https://sheeptester.github.io/scratch-vm/16-9/vm.min.js', '../vm.min.js');

    return html;
}

async function salvaComoArquivoHTML(file) {
    let html = await convertSb3ToHtml(file, true, false, true);
    await fs.writeFile(`html-files/${file}.html`, html, (err) => {
        if (err)
            return console.log(`Erro ao gravar arquivo (${file}): ${err}`);
    })
}

async function salvaComoArquivoPNG(file) {
    let html = await convertSb3ToHtml(file, false, true, false);
    return await nodeHtmlToImage({
        output: `png-files/${file}.png`,
        // waitUntil: 'domcontentloaded',
        waitUntil: 'networkidle0',
        html
    })
        // .then(() => console.log('The image was created successfully!'))
}

async function convert(file) {
    salvaComoArquivoHTML(file);
    await salvaComoArquivoPNG(file);
}

async function main(trabalhoId) {
    if (!fs.existsSync('sb3-files')) {
        fs.mkdirSync('sb3-files');
    }
    if (!fs.existsSync('html-files')) {
        fs.mkdirSync('html-files');
    }
    if (!fs.existsSync('png-files')) {
        fs.mkdirSync('png-files');
    }

    fs.readdir('sb3-files', function (err, files) {
        if (err) {
            return console.log('Erro ao ler arquivos: ' + err);
        }

        let inserts = "INSERT INTO `trabalho_aluno` (`trabalhoId`, `usuarioId`) VALUES";

        files.forEach(async (file) => {
            let splited = file.split('.');
            let format = splited.pop();
            if (format == 'sb3') {
                let alunoId = splited[0];
                await convert(alunoId);
                inserts += `\n(${trabalhoId}, ${alunoId}),`
            }
        });

        console.log("\n\n" + inserts + "\n\n");
    });
}

main(trabalhoId);