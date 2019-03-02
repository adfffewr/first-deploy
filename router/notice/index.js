const express = require('express');
const router = express.Router();
const connection = require('../config/database.js')
const multer = require('multer') //파일업로드를 위한 모듈
const path = require('path') //기본제동하는 path모듈
const fs = require('fs') //파일에 대한 읽고 쓰고 지우는 모듈



const upload = multer({
    storage: multer.diskStorage({ 
      destination: function (req, file, cb) { // 저장 파일경로
        cb(null, 'public/images/')
      },
      filename: function (req, file, cb) {  // 파일이름
        cb(null, new Date().valueOf() + path.extname(file.originalname))  // 날짜 원시값 + 확장자
      },
      fileFilter: function(req, file, cb) { // 파일필터
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
            req.validateErr = '"JPG, PNG 이미지만 업로드 가능합니다."'
            return cb(null, false, new Error('JPG, PNG 이미지만 업로드 가능합니다'));
            } else {
                cb(null, true)
            }
            cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    }),
  })





router.get('/detail/:no', (req, res) => {
  console.log('[[[[[  NOTICE DETAIL   ]]]]]')

  console.log('no = ' , req.params.no);

  const no = req.params.no
  connection.query(`SELECT 
                      NOTICE_MNG_NO
                    , NOTICE_TP
                    , INIT
                    , SUBJ
                    , CONTS
                    , ORI_IMG_NAME
                    , PHY_IMG_NAME
                    , REGR
                    , DATE_FORMAT(REG_DT, "%Y-%m-%d %H:%i") REG_DT
                    , URDR
                    , DATE_FORMAT(UPD_DT, "%Y-%m-%d %H:%i") UPD_DT
                    FROM TB_NOTICE
                    WHERE NOTICE_MNG_NO = ?
                    `
                    , [no], (err, rows) => {
    if (err) return res.status(401).end(JSON.stringify({err:'에러발생'}))

    console.log(rows[0]);

    const resData = {}

    if (rows[0]) {

      resData.ok = true
      resData.body = rows[0]

      res.status(200)
      res.json(resData)
      
    } else {
      resData.ok = true
      res.status(200)
      res.json(resData)
    }
  })

 
})



router.get('/list', (req, res) => {
  console.log('[[[[[  NOTICE LIST   ]]]]]')

  console.log('req.parmas =' , req.query)

  const search = req.query.search

  connection.query(`SELECT 
                      NOTICE_MNG_NO
                    , NOTICE_TP
                    , SUBJ
                    , CONTS
                    , DATE_FORMAT(REG_DT, "%Y-%m-%d %H:%i") REG_DT
                    FROM TB_NOTICE
                    WHERE SUBJ LIKE '%${search}%'
                    ORDER BY NOTICE_MNG_NO DESC`, (err, rows) => {
    
    if (err) return res.status(401).json({err:'에러발생'})

    // if (rows.length) {
      console.log(rows)

      const resData = {}

      resData.ok = true
      resData.body = rows
      res.status(200)
      res.json(resData)

    // }
  })
})

router.post('/register', upload.single('image') , (req, res) => {
  console.log('[[[[[ NOTICE REGISTER]]]]]')

  console.log(' REGISTER REQ', req.body);
  console.log(req.file)

    let oriImgName = '',
        phyImgName = ''

    if ( req.file ) {
        console.log(req.file)
        oriImgName = req.file.originalname
        phyImgName = req.file.filename
    }
  
 

  
  const form = JSON.parse(req.body.form)

  // const subj = form.subj,
  //       dpTp = form.dpTp,
  //       init = form.init,
  //       conts = form.conts

  const {subj, dpTp, init, conts} = form

        connection.query(`INSERT INTO TB_NOTICE
        (   NOTICE_TP
          , SUBJ
          , INIT
          , CONTS
          ,ORI_IMG_NAME
          ,PHY_IMG_NAME
          , REGR
          , REG_DT
          , URDR
          , UPD_DT
        )
        VALUES
        (
            ?
          , ?
          , ?
          , ?
          , ?
          , ?
          , 'admin'
          , now()
          , 'admin'
          , now()
        )`
      , [ dpTp, subj, `${init}`, conts , oriImgName , phyImgName ]
      , ( err, rows ) => {
        if (err) return res.status(401).end(JSON.stringify({err:'에러발생'}))

        if (rows.affectedRows > 0) {
          const resData = {}
          resData.insertId = rows.insertId
          resData.ok = true
          console.log(resData)
          res.status(200)
          res.end(JSON.stringify(resData))

        }
      }
    )
})


// router.post('/modify', upload.single('image') , (req, res) => {
//   console.log('[[[[[ NOTICE REGISTER]]]]]')

//   console.log(' REGISTER REQ', req.body);

//   const form = JSON.parse(req.body.form)

//   // const subj = form.subj,
//   //       dpTp = form.dpTp,
//   //       init = form.init,
//   //       conts = form.conts

//   let {subj, dpTp, init, conts , oriImgName , phyImgName} = form

//   const no = req.body.no

//   const imgPath = `public/images/${phyImgName}`

//   //파일이 있다는 뜻은 chang가 되었다

//   if (req.file) {
//     console.log('====  is req.file ====')

//     if (phyImgName) fs.unlinkSync(imgPath)
//         oriImgName = req.file.oriImgName
//         phyImgName = req.file.filename
//   }

//   if (!oriImgName && !req.file) {
//     console.log('==== in not req ==== ')

//     if (phyImgName) fs.unlinkSync(imgPath)
//     false.unlinkSync(imgPath)
//     oriImgName = ''
//     phyImgName = ''
//   }

  

//         connection.query(`UPDATE TB_NOTICE SET
//         NOTICE_TP = ?
//       , SUBJ      = ?
//       , INIT      = ?
//       , CONTS     = ?
//       , ORI_IMG_NAME = ?
//       , PHY_IMG_NAME = ?
//       , URDR      = 'admin'
//       , UPD_DT    = now()
//     WHERE NOTICE_MNG_NO = ?`
//       , [ dpTp, subj, `${init}`, conts , oriImgName, phyImgName, no]
//       , ( err, rows ) => {
//         if (err) return res.status(401).end(JSON.stringify({err:'에러발생'}))

//         if (rows.affectedRows > 0) {
//           const resData = {}
//           resData.insertId = rows.insertId
//           resData.ok = true
//           console.log(resData)
//           res.status(200)
//           res.end(JSON.stringify(resData))

//         }
//       }
//     )
// })

router.post('/modify', upload.single('image'), (req, res) => {
    console.log('[[[[[ NOTICE MODIFY ]]]]]');
  
    console.log('req.body.form = ', req.body.form)
    
    console.log('req.file = ', req.file)
  
    const form = JSON.parse(req.body.form)
  
    let {subj, dpTp, init, conts, oriImgName, phyImgName} = form
  
    const no = req.body.no
  
    const imgPath = `public/images/${phyImgName}`
  
    // 파일이 있다는 뜻은 change가 되었다
    // 파일을 지우고 추가한다
    if (req.file) {
      console.log('======== is req.file =======');
  
      if (phyImgName) fs.unlinkSync(imgPath)
      
      oriImgName = req.file.originalname
  
      phyImgName = req.file.filename
      
    }
    // 올라온 req.file파일이 없고 oriImgName도 없다는 뜻은
    // 파일추가가 없고 기존의 이미지만 지워졌다
    if (!oriImgName && !req.file) {
      console.log('======== is not req.file , oriImgName =======');
  
      oriImgName = ''
      phyImgName = ''
      fs.unlinkSync(imgPath)
    }
  
    connection.query(`UPDATE TB_NOTICE SET
                          NOTICE_TP    = ?
                        , SUBJ         = ?
                        , INIT         = ?
                        , CONTS        = ?
                        , ORI_IMG_NAME = ?
                        , PHY_IMG_NAME = ?
                        , URDR         = 'admin'
                        , UPD_DT       = now()
                      WHERE NOTICE_MNG_NO = ?
                     `
                      , [dpTp, subj, `${init}`, conts, oriImgName, phyImgName, no]
                      , (err, rows) => {
                          // console.log('rows =', rows);
  
                          if(err) return res.status(401).end(JSON.stringify({err: '에러발생'}))
  
                          console.log('rows = ', rows);
  
                          if(rows.affectedRows > 0) {
  
                            const resData = {}
  
                            resData.modifyId = no
                            resData.ok = true
  
                            res.status(200)
                            res.end(JSON.stringify(resData))
                          }
                        }
                      )
  })



module.exports = router