export default (data: Array<any>, page: number, length: number) => {
  let actualPage = length * (page - 1)
  const dataSend = []
  for (let i = 0; i < length; i++) {
    if (data[actualPage]) {
      dataSend.push(data[actualPage])
    }
    actualPage++
  }
  const pages = Math.round(data.length / length)

  return { data: dataSend, pages }
}
