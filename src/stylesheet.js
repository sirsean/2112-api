async function stylesheet(request) {
    const black = '#000019';
    const blue = '#525DDD';
    const yellow = '#F2CB04';
    return new Response(`
    @font-face {
        font-family: EvangelionRegular;
        src: url('https://files-cors.sirsean.workers.dev/fonts/EVANGELION-k227rn.ttf');
    }
    @font-face {
        font-family: SupplyMono;
        src: url('https://files-cors.sirsean.workers.dev/fonts/PPSupplyMono-Light.ttf');
    }
    body {
        margin: 16px;
        font-family: SupplyMono, monospace;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: ${black};
        color: ${yellow};
    }
    h1 {
        font-family: EvangelionRegular;
        font-weight: 100;
        font-size: 3em;
        color: ${blue};
    }
    a {
        color: ${blue};
    }
    code {
        font-family: SupplyMono, monospace;
    }
    hr {
        background-color: ${yellow};
        border-style: solid;
    }
    `);
}

export default stylesheet;
