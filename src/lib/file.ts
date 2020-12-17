import fs from "fs";
import path from "path";

/**
 * Update a .json file.
 *
 * @param filepath Path to file relative to the main directory
 * @param json JSON object to be serialised
 * @returns void
 */
export const updateJSON = (filepath: string, json: Record<string, any>): void => fs.writeFile(
    path.join(global.mainDir, filepath),
    JSON.stringify(json, null, '\t'),
    (err) => err && console.error(err)
);
