"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const QuestChanger_1 = __importDefault(require("./QuestChanger"));
const config_json_1 = require("../config/config.json");
class AlgorithmicQuestRandomizer {
    postAkiLoad(container) {
        config_json_1.enable && (0, QuestChanger_1.default)(container);
    }
}
module.exports = { mod: new AlgorithmicQuestRandomizer() };
