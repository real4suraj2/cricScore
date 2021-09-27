import axios, { AxiosResponse } from 'axios'
import pdf from 'html-pdf'
import cheerio from 'cheerio'

const SAVE_DIRECTORY = './' // Edit to save file to desired location
const BASE_URI = 'https://www.espncricinfo.com'

interface Message {
  status: 'success' | 'error'
  resp?: string
}

const saveFile = async (data: string): Promise<void> => {
  pdf.create(data).toFile(`${SAVE_DIRECTORY}/temp.pdf`, function() {
    Promise.resolve();
  });
}

const getMatches = async (): Promise<Set<string>> => {
  let matches: Set<string> = new Set()
  let $ = cheerio.load((await axios.get(`${BASE_URI}/live-cricket-score`) as AxiosResponse).data)
  $('.match-info-link-FIXTURES').each((_, element) => {
    let link = $(element).attr('href')
    if (link) matches.add(link)
  })
  return matches
}

const getScoreCard = async (uri: string, save?: boolean): Promise<Message> => {
  try {
    let $ = cheerio.load((await axios.get(`${BASE_URI}${uri}`)).data)
    let data = $('.live-scorecard').html()
    if (data) {
      let resp = ''
      $('.teams span').each((idx, element) => {
        //console.log(idx, $(element).text())
        if ([7, 8, 9, 10].indexOf(idx) !== -1) {
          let text = $(element).text()
          if (text) resp += '*' + $(element).text() + '*\n'
        }
      })
      $ = cheerio.load(data)
      let extract: string[] = []
      $('td').each((idx, element) => {
        //console.log(idx, $(element).text())
        if ([0, 1, 2, 8, 9, 10, 16, 17, 18, 19, 20].indexOf(idx) !== -1) {
          extract.push($(element).text())
        }
      })
      $('.current-partnerships span').each((_, element) => {
        let filtered = $(element).text()
        if (filtered.search('•') !== -1 || (filtered.search('FOW') !== -1 && filtered.trim().length > 5)) extract.push(filtered.trim())
      })
      resp += `
*BATTERS*
${extract[0]}:${extract[1]}/${extract[2]}
${extract[3]}:${extract[4]}/${extract[5]}

*BOWLER*
${extract[6]}
${extract[7]} Over(s)
${extract[8]} Maiden(s) 
${extract[9]} Run(s)
${extract[10]} Wicket(s)

`
      if (extract.length == 14) resp += `
*STATS*
${extract[11]}

${extract[12]}

${extract[13]}`

      if (save) {
        data = `<style>
body {
zoom: 60%;
}
table {
  border - collapse: collapse;
  margin: 25px 0;
  font - size: 0.9em;
  font - family: sans - serif;
  min - width: 400px;
  box - shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}
thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}
th,
td {
  padding: 12px 15px;
}
tbody tr {
  border-bottom: 1px solid #dddddd;
}
tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}
tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}
.runs-container {
  display: none;
}
</style>` + data
        await saveFile(data)
      }
      return { status: 'success', resp }
    }
  } catch (_) {
  }
  return { status: 'error' }
}

export { Message, getMatches, getScoreCard }
