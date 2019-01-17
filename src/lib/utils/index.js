const Utils = {
  renderTemplate (template = null, params = null) {
    if (!template || !params) {
      return null
    }
    // const rgx = new RegExp(`{${e}}`, 'g')
    Object.keys(params).map((e, i) => {
      const reg = `{{${e.toLowerCase()}}}`
      if (typeof params[e] === 'object') return
      while (template.indexOf(reg) > -1) {
        template = template.replace(reg, params[e])
      }
    })

    return template
  }
}

module.exports = Utils
