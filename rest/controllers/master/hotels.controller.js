module.exports = (dbModel, sessionDoc, req) =>
  new Promise(async (resolve, reject) => {
    switch (req.method.toUpperCase()) {
      case 'GET':
        if (req.params.param1 != undefined) {
          getOne(dbModel, sessionDoc, req).then(resolve).catch(reject)
        } else {
          getList(dbModel, sessionDoc, req).then(resolve).catch(reject)
        }
        break
      case 'POST':
        post(dbModel, sessionDoc, req).then(resolve).catch(reject)

        break
      case 'PUT':
        put(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      case 'DELETE':
        deleteItem(dbModel, sessionDoc, req).then(resolve).catch(reject)
        break
      default:
        restError.method(req, reject)
        break
    }
  })

function getOne(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    dbModel.hotels
      .findOne({ _id: req.params.param1 })
      .then(resolve)
      .catch(reject)
  })
}

function getList(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let options = {
      page: req.query.page || (req.query.pageIndex || 0) + 1,
      // populate: [
      //   {
      //     path: 'hotels',
      //     select: '_id name',
      //   },
      // ],
    }

    if (req.query.pageSize || req.query.limit)
      options.limit = req.query.pageSize || req.query.limit

    let filter = {}
    console.log(`req.query:`,req.query)
    if ((req.query.my || '').toString()=='true') {
      filter.owner = sessionDoc.member
    }
    if ((req.query.passive || '') != '') {
      filter.passive = req.query.passive
    }

    // if ((req.query.status || '') != '') {
    //   filter.status = req.query.status
    // }
    console.log(`filter:`,filter)
    dbModel.hotels.paginate(filter, options).then(resolve).catch(reject)
  })
}

function post(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    let data = req.body || {}
    data._id = undefined
    data.owner=sessionDoc.member
    let newDoc = new dbModel.hotels(data)

    if (!epValidateSync(newDoc, reject)) return
    newDoc.save().then(resolve).catch(reject)
  })
}

function put(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, reject)
    let data = req.body || {}
    delete data._id
    
    dbModel.hotels
      .findOne({ _id: req.params.param1, owner:sessionDoc.member  })
      .then((doc) => {
        if (dbnull(doc, reject)) {
          let newDoc=Object.assign(doc,data)
          // let newDoc=new dbModel.hotels(Object.assign({}, doc.toJSON(), data))
          if (!epValidateSync(newDoc, (err)=>{
            reject(err)
          })) return
          newDoc.save().then(resp=>{
            console.log('resp:',resp)
            resolve(resp)
          }).catch(err=>{
            console.log(err)
            reject(err)
          })
        }
      })
      .catch(err=>{
        console.log(err)
        reject(err)
      })
  })
}

function deleteItem(dbModel, sessionDoc, req) {
  return new Promise((resolve, reject) => {
    if (req.params.param1 == undefined) return restError.param1(req, next)
    let data = req.body || {}
    data._id = req.params.param1

    dbModel.hotels.removeOne(sessionDoc, { _id: data._id, owner:sessionDoc.member }).then(resolve).catch(err=>{
      console.log(err)
      reject(err)
    })
  })
}
