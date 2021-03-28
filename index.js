const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const Datastore = require("nedb");
const express = require('express');
const { request } = require('express');

//On créé le serveur
let app = express();
app.listen(3000, () => console.log("listening at 3000"));
app.use(express.static('public'));
app.use(express.json({}))

// On charge la base de données
const database = new Datastore("database.db");
database.loadDatabase();


// On scrap le site qu'on veut stock les données dans la DB
function scrap(idChaine) {
    (async () => {
        idChaine.trim();
        
        // On vide la DB
        database.remove({}, {multi: true});

        // On lance chrome
        const browser = await puppeteer.launch({headless: true});

        // On ouvre une nouvelle page
        const socialblade = await browser.newPage()

        // On défini l'url socialblade qu'on veut ouvrir
        var urlSocialblade = "https://socialblade.com/youtube/channel/" + idChaine;

        // On va sur socialblade
        await socialblade.goto(urlSocialblade);

        // On console les metrics puppeteer
        const metrics1 = await socialblade.metrics();
        console.log(metrics1.TaskDuration)

        // Idyoutube
        const idYoutube = socialblade.url().slice(32);

        // On défini quelle url youtube utiliser
        var url;
        if (idYoutube.slice(0, 2) === "c/") {
            url = "https://www.youtube.com/" + idYoutube + "/videos";
        } else if (idYoutube.slice(0, 4) != "user" && idYoutube.slice(5).length >= 24) {
            url = "https://www.youtube.com/" + idYoutube + "/videos";
        } else if (idYoutube.slice(0, 4) != "user" && idYoutube.slice(5).length <= 24) {
            url = "https://www.youtube.com/user" + idYoutube.slice(7) + "/videos";
        } else {
            url = "https://www.youtube.com/" + idYoutube + "/videos";
        }

        // On ferme socialblade
        await socialblade.close()

        // On ouvre une nouvelle page
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 6000,
        })
        console.log("allo?: " + url)

        // On ouvre youtube
        await page.goto(url, {"waitUntil" : "networkidle0"});

        // On console les metrics puppeteer
        const metrics2 = await page.metrics();
        console.log(metrics2.TaskDuration)

        // On récupère les minias
        const minias = await page.evaluate(() => {
            let minias = []
            let elements = document.querySelectorAll("ytd-grid-video-renderer.style-scope");
            for (element of elements) {
                minias.push({
                img: element.querySelector("img")?.src,
                videolink: element.querySelector("a")?.href,
                })
            }
            return minias;
        });

        // On regarde si ça a trouvé des minias
        if(minias.length != 0) {
            //console.log(minias)
            database.insert(minias);
            await browser.close();
            return minias;
        } else if (minias.length === 0) {
            scrap("pousour");
            await browser.close();
        }
    })();
}

scrap("Pousour")


app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end;
            return
        }
        response.json(data)
    })
})

var channelId = "";

app.post('/api', (request, response) => {
    console.log('I got a request !')
    console.log(request.body);
    const data = request.body;
    response.json({
        status: "success",
        idChaine: data.channelId,
    });
    channelId = data.channelId;
    scrap(channelId) 
})







