import {parse} from "papaparse";

export class Dataset {
  static async getDatasetKey(url: string) {
    const firstData = await this.getDataset(url, 1);
    console.log(firstData[0])
    return Object.keys(firstData[0]);
  }

  static getDatasetId(url:string) {
    // remove query params from url
    let urlWithoutQueryParams = url.split("?")[0];

    // remove trailing slash
    if (urlWithoutQueryParams.endsWith("/")) {
      urlWithoutQueryParams = urlWithoutQueryParams.slice(0, -1);
    }
    urlWithoutQueryParams = urlWithoutQueryParams.replace(/\/[^\/]*$/, "");

    // get the dataset key
    return urlWithoutQueryParams.split("/").pop();
  }

  static async getDataset(url: string, limit?: number): Promise<any[]> {
    const datasetKey = this.getDatasetId(url);

    // get the dataset
    let apiUrl = `https://data.issy.com/api/explore/v2.1/catalog/datasets/${datasetKey}/records`;

    if (limit) {
      apiUrl += `?limit=${limit}`;
    } else {
      apiUrl += "?limit=100";
    }

    let result = [];
    let offset = 0;
    let count = limit || 0;

    while (result.length < count || count === 0) {
      const res = await fetch(apiUrl + `&offset=${offset}`)
      const json = await res.json();

      result = result.concat(json.results);
      if (count === 0) count = json.count;
      offset += 100;
    }

    return result;
  }
}
