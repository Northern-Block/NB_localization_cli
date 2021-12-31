import fs from "fs/promises";

// Types
import { JSONObject } from "@typings/app.types";

class FileService {
  extensions = ["js", "json", "ts"];

  /**
   * Check whether a translation file exists
   *
   * @param   filePath - Translation file path
   * @returns Whether translation file exists
   */
  async checkTranslationFilePath(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parse a translation file
   *
   * @param   filePath - Translation file path
   * @throws  Error if file path is invalid/nonexistant
   * @returns Translation file data
   */
  async readTranslationFile(filePath: string): Promise<JSONObject> {
    const extension = filePath.split(".").pop();
    if (!extension || !this.extensions.includes(extension)) {
      throw new Error("File type is invalid");
    }

    const fileExists = await this.checkTranslationFilePath(filePath);
    if (!fileExists) throw new Error("File path does not exist!");

    if (extension === "json") {
      const fileData = await fs.readFile(filePath, "utf-8");
      if (!fileData) throw new Error("File data is invalid!");

      try {
        const jsonData = JSON.parse(fileData);
        return jsonData;
      } catch {
        throw new Error("File is invalidly formatted");
      }
    } else if (extension === "js" || extension === "ts") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fileData = require(`../../${filePath}`);
      return fileData;
    } else {
      throw new Error("File type is invalid");
    }
  }
}

const singleton = new FileService();
export default singleton;
