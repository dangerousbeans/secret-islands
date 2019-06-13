<template>
  <div class="avatar-cropper">
    <div
      class="avatar-cropper-overlay"
      v-if="dataUrl"
    >
      <div class="avatar-cropper-mark">
        <a
          @click="destroy"
          class="avatar-cropper-close"
          href="javascript:;"
        >&times;</a>
      </div>
      <div class="avatar-cropper-container">
        <div class="avatar-cropper-image-container">
          <img
            :src="dataUrl"
            @load.stop="createCropper"
            alt
            ref="img"
          >
        </div>
        <div class="avatar-cropper-footer">
          <button
            @click.stop.prevent="destroy"
            class="avatar-cropper-btn"
            v-text="labels.cancel"
          >Cancel</button>
          <button
            @click.stop.prevent="submit"
            class="avatar-cropper-btn"
            v-text="labels.submit"
          >Submit</button>
        </div>
      </div>
    </div>
    <input
      :accept="mimes"
      class="avatar-cropper-img-input"
      ref="input"
      type="file"
    >
  </div>
</template>

<script>
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
var dataurl = require('dataurl')

import sbotLibs from './../sbot'
import pull from 'pull-stream'


export default {
  props: {
    trigger: {
      type: [String, Element],
      required: true
    },
    uploadHandler: {
      type: Function
    },
    blobHandler: {
      type: Function
    },
    uploadUrl: {
      type: String
    },
    requestMethod: {
      type: String,
      default: 'POST'
    },
    uploadHeaders: {
      type: Object
    },
    uploadFormName: {
      type: String,
      default: 'file'
    },
    uploadFormData: {
      type: Object,
      default() {
        return {}
      }
    },
    cropperOptions: {
      type: Object,
      default() {
        return {
          aspectRatio: 1,
          autoCropArea: 1,
          viewMode: 1,
          movable: false,
          zoomable: false
        }
      }
    },
    outputOptions: {
      type: Object
    },
    outputMime: {
      type: String,
      default: null
    },
    outputQuality: {
      type: Number,
      default: 0.9
    },
    mimes: {
      type: String,
      default: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon'
    },
    labels: {
      type: Object,
      default() {
        return {
          submit: 'submit',
          cancel: 'cancel'
        }
      }
    }
  },
  data() {
    return {
      cropper: undefined,
      dataUrl: undefined,
      filename: undefined
    }
  },
  methods: {
    destroy() {
      this.cropper.destroy()
      this.$refs.input.value = ''
      this.dataUrl = undefined
    },
    submit() {
      this.$emit('submit')
      // if (this.uploadUrl) {
        this.uploadImage()
      // } else if (this.uploadHandler) {
      //   this.uploadHandler(this.cropper)
      // } else {
      //   this.$emit('error', 'No upload handler found.', 'user')
      // }
      this.destroy()
    },
    pickImage(e) {
      this.$refs.input.click()
      e.preventDefault()
      e.stopPropagation()
    },
    createCropper() {
      this.cropper = new Cropper(this.$refs.img, this.cropperOptions)
    },
    uploadImage() {
      // console.log("this.cropper.getCroppedCanvas(this.outputOptions)", this.cropper.getCroppedCanvas(this.outputOptions))
      var dataURL = this.cropper.getCroppedCanvas(this.outputOptions).toDataURL()
    
      
      this.$emit('uploading')

      // console.log("gotdataurl", dataURL)
      var _data = dataurl.parse(dataURL)

      this.$ssb.then((ssb) => {
  
        pull(
          pull.once(_data.data),
          ssb.blobs.add((err, hash) => {
            if(err) return alert(err.stack)

            var selected = {
              link: hash,
              size: _data.data.length,
              type: _data.mimetype,
              width: 512,
              height: 512
            }

            sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), {
              type: 'about',
              about: JSON.parse(localStorage.keys).id,
              image: selected
            }, (err,a) => {
              // console.log("finished", err, a)
              this.$emit('completed')
              this.$emit('uploaded')
            })
          
          })
        )
        })

        this.outputMime,
        this.outputQuality      
    }
  },
  mounted() {
    // listen for click event on trigger
    let trigger =
      typeof this.trigger == 'object'
        ? this.trigger
        : document.querySelector(this.trigger)
    if (!trigger) {
      this.$emit('error', 'No avatar make trigger found.', 'user')
    } else {
      trigger.addEventListener('click', this.pickImage)
    }

    // listen for input file changes
    let fileInput = this.$refs.input
    fileInput.addEventListener('change', () => {
      if (fileInput.files != null && fileInput.files[0] != null) {
        let reader = new FileReader()
        reader.onload = e => {
          this.dataUrl = e.target.result
        }

        reader.readAsDataURL(fileInput.files[0])

        this.filename = fileInput.files[0].name || 'unknown'
        this.mimeType = this.mimeType || fileInput.files[0].type
        this.$emit('changed', fileInput.files[0], reader)
      }
    })
  }
}
</script>

<style lang="scss">
.avatar-cropper {
  .avatar-cropper-overlay {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
  }

  .avatar-cropper-img-input {
    display: none;
  }

  .avatar-cropper-close {
    float: right;
    padding: 20px;
    font-size: 3rem;
    color: #fff;
    font-weight: 100;
    text-shadow: 0px 1px rgba(40, 40, 40, 0.3);
  }

  .avatar-cropper-mark {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .avatar-cropper-container {
    background: #fff;
    z-index: 999;
    box-shadow: 1px 1px 5px rgba(100, 100, 100, 0.14);

    .avatar-cropper-image-container {
      position: relative;
      max-width: 400px;
      height: 300px;
    }
    img {
      max-width: 100%;
      height: 100%;
    }

    .avatar-cropper-footer {
      display: flex;
      align-items: stretch;
      align-content: stretch;
      justify-content: space-between;

      .avatar-cropper-btn {
        width: 50%;
        padding: 15px 0;
        cursor: pointer;
        border: none;
        background: transparent;
        outline: none;
        &:hover {
          background-color: #2aabd2;
          color: #fff;
        }
      }
    }
  }
}
</style>