/* eslint-disable @typescript-eslint/naming-convention */
import { DependencyContainer } from "tsyringe";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import QuestChanger from "./QuestChanger";
import { enable } from "../config/config.json"

class AlgorithmicQuestRandomizer implements IPostAkiLoadMod {
    postAkiLoad(container: DependencyContainer): void {
        enable && QuestChanger(container)
    }
}

module.exports = { mod: new AlgorithmicQuestRandomizer() }