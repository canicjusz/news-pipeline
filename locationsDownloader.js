import QueryStream from "pg-query-stream";

class LocationsDownloader {
  static download(client, done) {
    const getLocationsQuery = "SELECT * FROM cities";
    const query = new QueryStream(getLocationsQuery);
    const stream = client.query(query);
    stream.on("end", done);
    return stream;
  }
}

export default LocationsDownloader;
