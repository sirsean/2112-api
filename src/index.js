import { ethers } from 'ethers';
import stylesheet from './stylesheet.js';
import { gameContract, narrativeContract, runnerContract } from './contracts.js';

async function favicon(request) {
    return Response.redirect('https://www.2112.run/assets/favicons/favicon.ico', 301);
}

async function home(request) {
    return new Response(`
    <!html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:title" content="2112 API" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://2112-api.sirsean.workers.dev" />
        <meta property="og:description" content="Simple API for reading info about 2112 Cryptorunners" />
        <link rel="stylesheet" href="/style.css" />
        <title>2112 API</title>
    </head>
    <body>
        <h1>2112 API</h1>

        <h2>Runner</h2>
        <code>/runner/{runnerId}</code>
        <p><a href="/runner/1448">Example</a></p>

        <hr />

        <h2>Runner Image</h2>
        <code>/runner/{runnerId}.png</code>
        <p><a href="/runner/1448.png">Example</a></p>

        <hr />

        <h2>Runs</h2>
        <code>/runner/{runnerId}/runs</code>
        <p><a href="/runner/1448/runs">Example</a></p>

        <hr />

        <h2>Single Run</h2>
        <code>/run/{runId}</code>
        <p><a href="/run/6289579c2fada5e3d35a5dca">Example</a></p>
    </body>
    `, {
        headers: {
            'Content-Type': 'text/html;charset=UTF-8',
        },
    });
}

const apiHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD',
};

async function apiResponse(body) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: apiHeaders,
    });
}

async function runnerImg(request, env) {
    const url = new URL(request.url);
    const re = /^\/runner\/(\d+).png$/;
    const [_, runnerId] = re.exec(url.pathname);
    return fetch(`https://mint.2112.run/tokens721/${runnerId}.json`)
        .then(r => r.json())
        .then(({ image }) => {
            return Response.redirect(image, 301);
        });
}

async function runner(request, env) {
    const url = new URL(request.url);
    const re = /^\/runner\/(\d+)$/;
    const [_, runnerId] = re.exec(url.pathname);
    return Promise.all([
        fetch(`https://mint.2112.run/tokens721/${runnerId}.json`).then(r => r.json()),
        gameContract(env).cryptoRunners(runnerId),
        runnerContract(env).ownerOf(runnerId),
        narrativeContract(env).narrative(runnerId),
    ]).then(([runner, chain, owner, narrative]) => {
        runner.attributes['Notoriety Points'] = chain.notorietyPoints.toNumber();
        runner.id = runnerId;
        runner.owner = owner;
        runner.narrative = narrative;
        return runner;
    }).then(apiResponse);
}

async function runs(request, env) {
    const url = new URL(request.url);
    const re = /^\/runner\/(\d+)\/runs$/;
    const [_, runnerId] = re.exec(url.pathname);
    return gameContract(env).getRunsByRunner(runnerId).then(runIds => {
        return runIds.slice().reverse();
    }).then(apiResponse);
}

async function viewRun(request, env) {
    const url = new URL(request.url);
    const re = /^\/run\/(.+)$/;
    const [_, runId] = re.exec(url.pathname);
    return gameContract(env).runsById(runId)
    .then(run => {
        return {
            notorietyPoints: run.notorietyPoints?.toNumber(),
            data: ethers.utils.formatUnits(run.data, 18),
            startTime: run.startTime?.toNumber(),
            endTime: run.endTime?.toNumber(),
        };
    }).then(apiResponse);
}

function handler(pathname) {
    const routes = [
        [/^\/$/, home],
        [/^\/favicon.ico$/, favicon],
        [/^\/style.css$/, stylesheet],
        [/^\/runner\/\d+\.png$/, runnerImg],
        [/^\/runner\/\d+$/, runner],
        [/^\/runner\/\d+\/runs$/, runs],
        [/^\/run\/.+$/, viewRun],
    ];

    for (let i=0; i < routes.length; i++) {
        const [re, handler] = routes[i];
        if (re.test(pathname)) {
            return handler;
        }
    }
    console.log(pathname, 'not found');

    return notFound;
}

export default {
    async fetch(request, env, context) {
        const url = new URL(request.url);
        return handler(url.pathname)(request, env);
    },
};
