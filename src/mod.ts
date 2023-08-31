/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { enable } from "../config/config.json"
import ItemChanger from "./ItemChanger/ItemChanger";

class AlgorithmicQuestRandomizer implements IPostAkiLoadMod {
    postAkiLoad(container: DependencyContainer): void {
        enable && ItemChanger(container)
    }
}

module.exports = { mod: new AlgorithmicQuestRandomizer() }