const puppeteer = require("puppeteer");
const { runQuery } = require("../services/mysql.service")
const { Scraping } = require("../models/scraping.model")

async function searchMovsCase(data) {
    return new Promise(async (resolve, reject) => {
        setTimeout(() => {
            resolve("Ok")
        }, 3000);
    });
    // const browser = await puppeteer.launch({
    //     headless: 'new',
    //     args: ["--no-sandbox", "--headless"],
    //     //   executablePath: '/usr/bin/google-chrome',
    // });

    // const responseMovs = await getMovs(browser, data);
    // return responseMovs;
}
async function getMovs(browser, data) {
    const { NameDB, fullUrl, CodigoExterno, cFecha, nCas_Id } = data
    try {
        const openPages = await browser.pages();
        for (let i = 1; i < openPages.length; i++) {
            await openPages[i].close();
        }
        const page = await browser.newPage();
        let expediente = CodigoExterno;
        let xcej = expediente.split("-");
        let cod_expediente = xcej[0];
        let cod_anio = xcej[1];
        let cod_incidente = xcej[2];
        let cod_distprov = xcej[3];
        let cod_organo = xcej[4];
        let cod_especialidad = xcej[5];
        let cod_instancia = xcej[6];
        await page.goto("https://cej.pj.gob.pe/cej/forms/busquedaform.html");
        const title = await page.title();
        console.log(`The title of the page is: ${title}`);
        await page.content();
        await page.waitForSelector("#busquedaPorCodigo");
        await page.click("#myTab > li:nth-child(2)");
        await page.waitForTimeout(300);
        await page.type("[id=cod_expediente]", cod_expediente, {
            delay: 1,
        });
        await page.type("[id=cod_anio]", cod_anio, {
            delay: 1,
        });
        await page.type("[id=cod_incidente]", cod_incidente, {
            delay: 1,
        });
        await page.type("[id=cod_distprov]", cod_distprov, {
            delay: 1,
        });
        await page.type("[id=cod_organo]", cod_organo, {
            delay: 1,
        });
        await page.type("[id=cod_especialidad]", cod_especialidad, {
            delay: 1,
        });
        await page.type("[id=cod_instancia]", cod_instancia, {
            delay: 1,
        });
        await page.click("#btnReload");
        await page.click("#btnRepro");
        await page.waitForSelector("#deleteSound > input");
        const textCaptcha = await page.$eval("#deleteSound > input", (input) => {
            return input.getAttribute("value");
        });
        await page.type("[id=codigoCaptcha]", textCaptcha, {
            delay: 5,
        });
        let errorNotExist = undefined
        let errorCaptcha = undefined
        await page.click("#consultarExpedientes");
        await page.waitForTimeout(300);
        try {
            errorNotExist = await page.$eval("#mensajeNoExisteExpedientes", (e) => {
                const computedStyles = window.getComputedStyle(e);
                return {
                    innerHTML: e.innerText.trim(),
                    display: computedStyles.getPropertyValue('display'),
                };
            });
            errorCaptcha = await page.$eval("#codCaptchaError", (e) => {
                const computedStyles = window.getComputedStyle(e);
                return {
                    innerHTML: e.innerText.trim(),
                    display: computedStyles.getPropertyValue('display'),
                };
            });

        } catch (error) {
            console.log("Low error:", error.message);
        }
        if (errorNotExist !== undefined && errorNotExist.display !== 'none') {
            throw new Error(errorNotExist.innerHTML);
        }
        if (errorCaptcha !== undefined && errorCaptcha.display !== 'none') {
            throw new Error(errorCaptcha.innerHTML);
        }

        await page.waitForSelector("#divCuerpo > div:nth-child(3)");
        let nCuadernos = (await page.$$("#divDetalles > div")).length;

        let arrayDataBook = [];
        let arrayDataBookInformation = [];
        let arrayDataMovs = [];
        let arrayDataNotif = [];
        let JsonDataResoluciones = [];


        for (let i = 1; i <= nCuadernos; i++) {
            let xCodigoC = await page.$eval("#divDetalles > div:nth-child(" + i + ") > div.celdCentro.textResalt", (e) => e.innerText.trim(),);
            let xCodigoExterno = await page.$eval("#divDetalles > div:nth-child(" + i + ") >  div.celdCentroD > div.divNroJuz > div:nth-child(1)", (e) => e.innerText.trim(),);
            let xDetalle = await page.$eval("#divDetalles > div:nth-child(" + i + ") > div.celdCentroD > div.partesp", (e) => e.innerText.trim(),);
            let xJuzgado = await page.$eval("#divDetalles > div:nth-child(" + i + ") >  div.celdCentroD > div.divNroJuz > div:nth-child(2) > b", (e) => e.innerText.trim(),);
            if (xCodigoExterno == CodigoExterno) {
                await page.click("#divDetalles > div:nth-child(" + i + ") >  .celdCentro > form > button",);
                await page.waitForSelector("#divCuerpo > div:nth-child(2) > div");
                var boddyDataBook = {
                    CodigoC: xCodigoC,
                    CodigoExterno: xCodigoExterno,
                    Detalle: xDetalle,
                    Juzgado: xJuzgado,
                };
                arrayDataBook.push(boddyDataBook);

                let CodigoExterno = await page.$eval("#gridRE > div:nth-child(1) > div.celdaGrid.celdaGridXe > b", (e) => e.innerText.trim());
                let orgJuris = await page.$eval("#gridRE > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim());
                let disJuris = await page.$eval("#gridRE > div:nth-child(2) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let juez = await page.$eval("#gridRE > div:nth-child(3) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let espLegal = await page.$eval("#gridRE > div:nth-child(3) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let fInicio = await page.$eval("#gridRE > div:nth-child(4) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let proceso = await page.$eval("#gridRE > div:nth-child(4) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let obs = await page.$eval("#gridRE > div:nth-child(5) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let esp = await page.$eval("#gridRE > div:nth-child(5) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let materia = await page.$eval("#gridRE > div:nth-child(6) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let estado = await page.$eval("#gridRE > div:nth-child(6) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let eProcesal = await page.$eval("#gridRE > div:nth-child(7) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let fConclusion = await page.$eval("#gridRE > div:nth-child(7) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let ubicacion = await page.$eval("#gridRE > div:nth-child(8) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let mConclusion = await page.$eval("#gridRE > div:nth-child(8) > div:nth-child(4)", (e) => e.innerText.trim(),);
                let sumilla = await page.$eval("#gridRE > div:nth-child(9) > div:nth-child(2)", (e) => e.innerText.trim(),);
                let xTipo = await page.$eval("#collapseTwo > div > div:nth-child(1) > div:nth-child(1)", (e) => e.innerText.trim());
                let nParticipantes = (await page.$$("#collapseTwo > div > div")).length;
                let strPart = "";
                for (let i = 2; i <= nParticipantes; i++) {
                    let xPart = await page.$eval("#collapseTwo > div > div:nth-child(" + i + ")", (e) => e.innerText.trim(),);
                    if (nParticipantes == i) {
                        strPart += xPart;
                    } else {
                        strPart += "(" + xTipo + ")" + xPart + "|";
                    }
                }
                var sPart = strPart.split("\n").join(" ");

                let EG = await runQuery("Call " + NameDB + ".Ma_sp_Insertar_Maestro_SCRP(?)", ["EG", estado]);
                let MA = await runQuery("Call " + NameDB + ".Ma_sp_Insertar_Maestro_SCRP(?)", ["MA", esp]);
                let MC = await runQuery("Call " + NameDB + ".Ma_sp_Insertar_Maestro_SCRP(?)", ["MC", materia]);

                var boddDataBookInformation = {
                    CodigoC: xCodigoC,
                    CodigoExterno: CodigoExterno,
                    General: [
                        {
                            OrganoJurisdiccional: orgJuris,
                            DistritoJudicial: disJuris,
                            Juez: juez,
                            EspecialistaLegal: espLegal,
                            FechadeInicio: fInicio,
                            Proceso: proceso,
                            Observacion: obs,
                            Especialidad: esp,
                            Materia: materia,
                            Estado: estado,
                            EtapaProcesal: eProcesal,
                            FechaConclusión: fConclusion,
                            Ubicación: ubicacion,
                            MotivoConclusión: mConclusion,
                            Sumilla: sumilla,
                            Participantes: sPart,
                        },
                    ],
                };
                arrayDataBookInformation.push(boddDataBookInformation);
                await page.waitForSelector("#collapseThree > div");
                let xMovimientos = (await page.$$("#collapseThree > div")).length - 1;
                xMovimientos = xMovimientos >= 51 ? 50 : xMovimientos;

                for (let i = 0; i < xMovimientos; i++) {
                    let CodigoMoviento = xMovimientos - i;
                    let xFechaResolucion = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xResolucion = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xTNotificacion = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xActo = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xFojas = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xProveido = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(3) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xSumilla = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2)", (e) => e.innerText.trim(),);
                    let xDescripcionUsuario = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim(),);

                    // function detect case frostbitten
                    // ejecute one
                    if (i == 0) {
                        await createArrayAllCases(xFechaResolucion, NameDB, nCas_Id)
                    }

                    let boddyDataMovs = {
                        Moviento: CodigoMoviento,
                        CodigoC: xCodigoC,
                        CodigoExterno: CodigoExterno,
                        FechaResolucion: xFechaResolucion,
                        Resolucion: xResolucion,
                        TNotificacion: xTNotificacion,
                        Acto: xActo,
                        Fojas: xFojas,
                        Proveido: xProveido,
                        Sumilla: xSumilla,
                        ComentarioUsuario: xDescripcionUsuario,
                        cFechaDescarga: "Descargado el " + cFecha,
                    };
                    arrayDataMovs.push(boddyDataMovs)
                    var xnNotificacion = (await page.$$("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div > div",)).length;
                    for (let j = 0; j < xnNotificacion; j++) {
                        let CodigoNotificacion = xnNotificacion - j;
                        let CodigoMoviento = xMovimientos - i;
                        let titulo = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div:nth-child(" + (j + 1) + ") > div >h5", (e) => e.innerText.trim(),);
                        let xDestinatario = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div:nth-child(" + (j + 1) + ") > div > div > div:nth-child(1) > div:nth-child(2)", (e) => e.innerText.trim(),);
                        let xFecha = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div:nth-child(" + (j + 1) + ") > div > div > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim(),);
                        let xAnexos = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div:nth-child(" + (j + 1) + ") > div > div:nth-child(3) > div:nth-child(1) > div:nth-child(2)", (e) => e.innerText.trim(),);
                        let xFormaEntrega = await page.$eval("#pnlSeguimiento" + (i + 1) + " > div:nth-child(2) > div > div:nth-child(2)> div:nth-child(" + (j + 1) + ") > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(2)", (e) => e.innerText.trim(),);
                        let boddyDataNotif = {
                            CodigoNotificacion: CodigoNotificacion,
                            CodigoMoviento: CodigoMoviento,
                            CodigoExterno: xCodigoExterno,
                            titulo: titulo ? titulo : "",
                            destinatario: xDestinatario,
                            fechaEnvio: xFecha,
                            anexos: xAnexos,
                            formaEntrega: xFormaEntrega,
                        };
                        arrayDataNotif.push(boddyDataNotif);
                    }
                }
                break;
            }
        }

        const boddyDataNews = [
            nCas_Id,
            JSON.stringify(arrayDataBook).replace(/\//g, "").toString(),
            JSON.stringify(arrayDataBookInformation).replace(/\//g, "").toString(),
            JSON.stringify(arrayDataMovs).replace(/\//g, "").toString(),
            JSON.stringify(arrayDataNotif).replace(/\//g, "").toString(),
            JSON.stringify(JsonDataResoluciones).replace(/\//g, "").toString(),
            "[]",
        ];
        let getMovsCases = await runQuery("Call " + NameDB + ".usp_Casos_Movs_Select(?)", [nCas_Id]);
        if (typeof getMovsCases == 'object') {
            if (getMovsCases[0].cCav_Movimientos.length > 0) {
                var NewMovimientos = JSON.parse(JSON.stringify(arrayDataMovs).replace(/\//g, "").toString());
                var CantidadNewMov = NewMovimientos.length;

                var NewNotificaciones = JSON.parse(JSON.stringify(arrayDataNotif).replace(/\//g, "").toString());
                var CantidadNewNoti = NewNotificaciones.length;

                var cCav_Movimientos = JSON.parse(getMovsCases[0].cCav_Movimientos)
                var cCav_Notificacion = JSON.parse(getMovsCases[0].cCav_Notificacion)
                var Movimientos = cCav_Movimientos.filter((DatosAdd) => DatosAdd.CodigoExterno === CodigoExterno,).splice(0, CantidadNewMov);
                var Notificaciones = cCav_Notificacion.filter((DatosAdd) => DatosAdd.CodigoExterno === CodigoExterno,).splice(0, CantidadNewNoti);

                var JsonNovedad = [];
                var JsonNotif = [];

                for (let i = 0; i < NewMovimientos.length; i++) {
                    let exists = Movimientos.filter((e) => e.FechaResolucion == NewMovimientos[i].FechaResolucion && e.Acto == NewMovimientos[i].Acto && e.Sumilla == NewMovimientos[i].Sumilla).length;
                    if (exists == 0) {
                        JsonNovedad.push(NewMovimientos[i]);
                    }
                }

                for (let i = 0; i < NewNotificaciones.length; i++) {
                    let exists = Notificaciones.filter((e) => e.titulo == NewNotificaciones[i].titulo && e.CodigoMoviento == NewNotificaciones[i].CodigoMoviento).length;
                    if (exists == 0) {
                        JsonNotif.push(NewNotificaciones[i]);
                    }
                }

                for (let i = 0; i < JsonNotif.length; i++) {
                    let exists = JsonNovedad.filter((e) => e.Moviento == JsonNotif[i].CodigoMoviento && e.CodigoExterno == JsonNotif[i].CodigoExterno,).length;
                    if (exists == 0) {
                        let Mov = Movimientos.find((e) => e.CodigoExterno == JsonNotif[i].CodigoExterno);
                        JsonNovedad.push(Mov);
                    }
                }

                const boddyDataNov = [
                    nCas_Id,
                    JSON.stringify(JsonNovedad)
                        .replace(/\//g, "")
                        .toString(),
                    JSON.stringify(JsonNotif)
                        .replace(/\//g, "")
                        .toString(),
                ];
                if (JsonNovedad.length > 0 || JsonNotif.length > 0) {
                    let responseInsertCasesMovsTemp = await runQuery("Call " + NameDB + ".usp_Cookie_Casos_Movs_Insert(?)", boddyDataNews);
                    let responseInsertCasesNovTemp = await runQuery("Call " + NameDB + ".sp_cookie_novedades_Insert(?)", boddyDataNov);
                }
            }

        }

    } catch (error) {
        return new Scraping(500, error.message);
    } finally {
        await browser.close();
        return new Scraping(200, 'scraping finished correctly');
    }
}
async function createArrayAllCases(xFechaResolucion, NameDB, nCas_Id) {
    try {
        let cFechaResolucion = xFechaResolucion.split(" ")[0].split("/");
        cFechaResolucion = cFechaResolucion[2] + "-" + cFechaResolucion[1] + "-" + cFechaResolucion[0];
        const fechaActual = new Date();
        const fechaComparar = new Date(cFechaResolucion);
        const diferenciaFechas = fechaActual.getTime() - fechaComparar.getTime();
        const dias = Math.floor(diferenciaFechas / (1000 * 60 * 60 * 24),);
        if (dias >= 30) {
            const result = await runQuery("Call " + NameDB + ".sp_Cookie_Congelado_Insert(?)", [nCas_Id]);
        }
    } catch (error) {
        return error.message;
    }
}

module.exports = {
    searchMovsCase,
};