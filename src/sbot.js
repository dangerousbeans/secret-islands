import pull from 'pull-stream'
pull.paraMap = require('pull-paramap')
const { isBlob } = require('ssb-ref')

export default 
{
  displayName (sbot, feedId, cb) {
    var data = {}

    const opts = {
        limit: 1,
        reverse: true,
        query: [
          {
            $filter: {
              value: {
                author: feedId,
                content: {
                  type: 'about',
                  about: feedId,
                  name: { $is: 'string' } // there's a name string present
                }
              },
              timestamp: { $gt: 0 } // a hack that forces ordering by timestamp
            }
          },
          {
            $map: {
              name: ['value', 'content', 'name']
            }
          }
        ]
      }

    pull(
        sbot.query.read(opts),
        pull.collect((err, results) => {
        if (err) {
          this.cb(err)
          return
        }

        var name
        if (!results || !results.length) name = feedId
        else name = results[0].name
        // console.log(name) // debug / see the names fly by as we get them!

        data.authorName = name
        
        cb(null, data)
      })
    )
  },
  avatar (sbot, feedId, cb) {

    const opts = {
      reverse: true,
      query: [
        {
          $filter: {
            value: {
              author: feedId,
              content: {
                type: 'about',
                about: feedId,
                image: { $truthy: true }
              },
              timestamp: { $gt: 0 } // a hack that forces ordering by timestamp
            }
          }
        },
        {
          $map: {
            image: ['value', 'content', 'image']
          }
        }
      ]
    }

    pull(
      sbot.query.read(opts),
      // hooray the format for image about is non-standardised... could be image.link or image that the blob link is stored under
      pull.map(data => typeof data.image === 'string'
        ? data.image
        : data.image.link
      ),
      pull.filter(link => isBlob(link)),
      pull.take(1),
      pull.collect((err, results) => {
        if (err) {
          cb(err)
          return
        }

        if (!results || !results.length) cb(null, null)
        else cb(null, results[0])
      })
    )
  }
}