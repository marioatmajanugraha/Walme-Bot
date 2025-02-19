const axios = require('axios');
const fs = require('fs');
const chalk = require('chalk');
const cfonts = require('cfonts');
const crypto = require('crypto');
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Tampilkan Banner dengan CFonts
cfonts.say('Airdrop 888', {
    font: 'block',
    align: 'center',
    colors: ['cyan'],
    background: 'black',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
});
console.log(chalk.green('✅ Script coded by - @balveerxyz || Walme Task\n'));

// Membuat interface untuk input user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Gunakan proxy? (y/n) : ', async (useProxy) => {
    rl.close();
    let useProxyMode = useProxy.toLowerCase() === 'y';

    // Load token dari file tokens.txt
    let authTokens;
    try {
        authTokens = fs.readFileSync('tokens.txt', 'utf-8').split('\n').map(t => t.trim()).filter(Boolean);
        console.log(chalk.green(`✅ Berhasil memuat ${authTokens.length} akun Walme dari tokens.txt!`));
    } catch (err) {
        console.log(chalk.red('❌ Gagal membaca tokens.txt! Pastikan file ada dan berisi token.'));
        process.exit(1);
    }

    // Load proxy jika mode proxy aktif
    const proxies = useProxyMode && fs.existsSync('proxy.txt') ? 
        fs.readFileSync('proxy.txt', 'utf-8').split('\n').filter(Boolean) : [];

    // Fungsi memilih proxy acak
    const getProxyAgent = () => {
        if (useProxyMode && proxies.length > 0) {
            const randomProxy = proxies[Math.floor(Math.random() * proxies.length)].trim();
            console.log(chalk.yellow(`🔗 Menggunakan Proxy: ${randomProxy}`));
            return randomProxy.startsWith('http') ? new HttpsProxyAgent(randomProxy) : new SocksProxyAgent(randomProxy);
        }
        return null;
    };

    // Fungsi membuat username random
    const generateUsername = () => `user_${crypto.randomBytes(3).toString('hex')}`;

    // Fungsi delay dengan waktu acak
    const delay = (min, max) => new Promise(resolve => {
        const time = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(chalk.gray(`⏳ Menunggu ${time / 1000} detik sebelum melanjutkan...`));
        setTimeout(resolve, time);
    });

    // Fungsi menyelesaikan task
    const processTasks = async (authToken) => {
        const proxyAgent = getProxyAgent();
        const headers = {
            'accept': 'application/json',
            'authorization': `Bearer ${authToken}`,
            'origin': 'https://waitlist.walme.io',
            'referer': 'https://waitlist.walme.io/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
        };

        try {
            const response = await axios.get('https://api.walme.io/waitlist/tasks', { headers, httpsAgent: proxyAgent });

            let completedTasks = 0;
            let skippedTasks = 0;

            if (response.data.length > 0) {
                console.log(chalk.blue('🔍 Task ditemukan! Memproses...'));

                for (let task of response.data) {
                    const taskTitle = task.title.toLowerCase();

                    // Skip task "Connect Telegram", "Connect X", dan "Connect Discord"
                    if (taskTitle.includes('connect telegram') || taskTitle.includes('connect x') || taskTitle.includes('connect discord')) {
                        console.log(chalk.yellow(`⏩ Melewati task: ${task.title}`));
                        skippedTasks++;
                        continue;
                    }

                    if (task.status !== 'completed') {
                        console.log(chalk.yellow(`⚡ Menyelesaikan task: ${task.title}`));

                        // Delay random antara 5 - 15 detik sebelum menyelesaikan task
                        await delay(5000, 15000);

                        try {
                            await axios.patch(`https://api.walme.io/waitlist/tasks/${task.id}`, {}, { headers, httpsAgent: proxyAgent });
                            console.log(chalk.green(`✅ Task selesai: ${task.title}`));
                            completedTasks++;
                        } catch (err) {
                            console.log(chalk.red(`❌ Gagal menyelesaikan task: ${task.title}`), err.response ? err.response.data : err.message);
                        }
                    }
                }

                console.log(chalk.magenta(`🎉 Akun ${authToken.slice(0, 5)}: ${completedTasks} Task selesai!`));
                console.log(chalk.gray(`⏩ ${skippedTasks} Task dilewati (Butuh Auth Manual) 🔄`));
            } else {
                console.log(chalk.green(`🎉 Akun ${authToken.slice(0, 5)}: Tidak ada task baru!`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Gagal mengambil task untuk akun ${authToken.slice(0, 5)}!`), error.message);
        }
    };

    // Fungsi membuat username di Walme
    const createUsername = async (authToken) => {
        const username = generateUsername();
        const proxyAgent = getProxyAgent();

        console.log(chalk.cyan(`🔹 Akun: ${authToken.slice(0, 5)}... | Username: ${username}`));

        const headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': `Bearer ${authToken}`,
            'origin': 'https://walme.io',
            'referer': 'https://walme.io/_synapse/client/pick_username/account_details',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
        };

        const data = new URLSearchParams({
            username: username,
            use_avatar: 'true'
        });

        try {
            console.log(chalk.blue(`🚀 Mengirim request untuk akun ${authToken.slice(0, 5)}...`));

            const response = await axios.post('https://walme.io/_synapse/client/pick_username/account_details', data, {
                headers,
                httpsAgent: proxyAgent
            });

            if (response.status === 302 && response.headers.location.includes('sso_register')) {
                console.log(chalk.green(`✅ Username "${username}" berhasil dibuat untuk akun ${authToken.slice(0, 5)}!`));
            } else {
                console.log(chalk.red(`⚠️ Gagal membuat username untuk akun ${authToken.slice(0, 5)}.`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error untuk akun ${authToken.slice(0, 5)}:`), error.message);
        }
    };

    // Jalankan semua akun
    for (const token of authTokens) {
        await createUsername(token);
        await processTasks(token);
    }

    console.log(chalk.green('🎉 Semua akun telah diproses!'));
});
