<template>
  <!--   v-if="!arrowControl" -->
  <div class="el-time-spinner ecms-time-spinner"
       :class="{ 'has-seconds': showSeconds }">
    <template>
      <el-scrollbar @mouseenter.native="emitSelectRange('hours')"
                    @mousemove.native="adjustCurrentSpinner('hours')"
                    class="el-time-spinner__wrapper"
                    wrap-style="max-height: inherit "
                    view-class="el-time-spinner__list"
                    noresize
                    tag="ul"
                    ref="hours">
        <li @click="handleClick('hours', { value: hour, disabled: disabled })"
            v-for="(disabled, hour) in hoursList"
            v-bind:key="hour"
            class="el-time-spinner__item"
            :class="{ 'active': hour === (hours-hourMultiple), 'disabled': disabled }">{{ ('0' + (amPmMode ? ((hour+hourMultiple) % 12 || 12) : hour+hourMultiple )).slice(-2) }}{{ amPm(hour+hourMultiple) }}</li>
      </el-scrollbar>
      <el-scrollbar @mouseenter.native="emitSelectRange('minutes')"
                    @mousemove.native="adjustCurrentSpinner('minutes')"
                    class="el-time-spinner__wrapper"
                    wrap-style="max-height: inherit "
                    view-class="el-time-spinner__list"
                    noresize
                    tag="ul"
                    ref="minutes">
        <li v-for="(minute, key) in minuteList"
            v-bind:key="key"
            @click="handleClick('minutes', { value: key, disabled: false })"
            class="el-time-spinner__item"
            :class="{ 'active': key === (minutes- curMinutes)/minutesMultiple }">{{ ('0' + (key*minutesMultiple+curMinutes)).slice(-2) }}</li>
      </el-scrollbar>
    </template>
  </div>
</template>

<script type="text/babel">
  import { getRangeHours, modifyTime } from '../util'
  import RepeatClick from 'element-ui/src/directives/repeat-click'
  import dayjs from 'dayjs'
  export default {
    directives: {
      repeatClick: RepeatClick
    },

    props: {
      date: {},
      defaultValue: {}, // reserved for future use
      showSeconds: {
        type: Boolean,
        default: false
      },
      arrowControl: Boolean,
      amPmMode: {
        type: String,
        default: '' // 'a': am/pm  'A': AM/PM
      },
      minDate: Number,
      maxDate: Number,
    },

    computed: {
      hours () {
        return this.date.getHours()
      },
      minutes () {
        return this.date.getMinutes()
      },
      minuteList () {
        if (this.hoursList) { }
        if (this.minDate || this.maxDate) {
          let idx = this.dealMinute()
          // console.log('-->idx', idx);
          return parseInt(idx)
        }
        return this.date.getMinutes()
      },
      seconds () {
        return this.date.getSeconds()
      },
      hoursList () {
        let arr = getRangeHours(this.selectableRange)
        if (this.minDate || this.maxDate) {
          return this.dealHours(arr)
        }
        return arr
      },
      arrowHourList () {
        const hours = this.hours
        return [
          hours > 0 ? hours - 1 : undefined,
          hours,
          hours < 23 ? hours + 1 : undefined
        ]
      },
      arrowMinuteList () {
        const minutes = this.minutes
        return [
          minutes > 0 ? minutes - 1 : undefined,
          minutes,
          minutes < 59 ? minutes + 1 : undefined
        ]
      },
      arrowSecondList () {
        const seconds = this.seconds
        return [
          seconds > 0 ? seconds - 1 : undefined,
          seconds,
          seconds < 59 ? seconds + 1 : undefined
        ]
      }
    },
    data () {
      return {
        hourMultiple: 0, // 小时
        minutesMultiple: 5, // 分钟
        curMinutes: 0,
        selectableRange: [],
        currentScrollbar: null
      }
    },

    mounted () {
      this.$nextTick(() => {
        !this.arrowControl && this.bindScrollEvent()
      })
    },
    methods: {
      dealMinute () {
        this.curMinutes = 0
        if (dayjs(this.date).format('YYYY-MM-DD') === dayjs(this.minDate).format('YYYY-MM-DD')) {
          if (this.hours === dayjs(this.minDate).hours()) {
            this.curMinutes = dayjs(this.minDate).minute()
            if (this.curMinutes === 55) return 1
            return (55 - this.curMinutes) / 5
          }
        } else if (dayjs(this.date).format('YYYY-MM-DD') === dayjs(this.maxDate).format('YYYY-MM-DD')) {
          if (this.hours === dayjs(this.maxDate).hours()) {
            let minutes = dayjs(this.maxDate).minute()
            return minutes / 5
          }
        }
        return 12
      },
      dealHours (arr) {
        this.hourMultiple = 0
        // 相同的一天
        if (dayjs(this.date).format('YYYY-MM-DD') === dayjs(this.minDate).format('YYYY-MM-DD')) {
          let hours = dayjs(this.minDate).hour()
          if (hours <= 23) {
            arr.splice(0, hours)
            this.hourMultiple = hours
          }
        } else if (dayjs(this.date).format('YYYY-MM-DD') === dayjs(this.maxDate).format('YYYY-MM-DD')) {
          let hours = dayjs(this.maxDate).hour()
          arr.splice(hours)
        }
        return arr
      },
      increase () {
        this.scrollDown(1)
      },

      decrease () {
        this.scrollDown(-1)
      },

      modifyDateField (type, value) {
        switch (type) {
          case 'hours': this.$emit('change', modifyTime(this.date, value + this.hourMultiple, this.minutes, this.seconds))
            break
          case 'minutes': this.$emit('change', modifyTime(this.date, this.hours, this.curMinutes + value * this.minutesMultiple, this.seconds))
            break
          case 'seconds': this.$emit('change', modifyTime(this.date, this.hours, this.minutes, value))
            break
        }
      },

      handleClick (type, { value, disabled }) {
        if (!disabled) {
          this.modifyDateField(type, value)
          this.emitSelectRange(type)
          this.adjustSpinner(type, value)
        }
      },

      emitSelectRange (type) {
        if (type === 'hours') {
          this.$emit('select-range', 0, 2)
        } else if (type === 'minutes') {
          this.$emit('select-range', 3, 5)
        } else if (type === 'seconds') {
          this.$emit('select-range', 6, 8)
        }
        this.currentScrollbar = type
      },

      bindScrollEvent () {
        const bindFuntion = (type) => {
          if (!this.$refs[type]) return
          this.$refs[type].wrap.onscroll = (e) => {
            // TODO: scroll is emitted when set scrollTop programatically
            // should find better solutions in the future!
            this.handleScroll(type, e)
          }
        }
        bindFuntion('hours')
        bindFuntion('minutes')
        bindFuntion('seconds')
      },

      handleScroll (type) {
        const value = Math.min(Math.floor((this.$refs[type].wrap.scrollTop - (this.scrollBarHeight(type) * 0.5 - 10) / this.typeItemHeight(type) + 3) / this.typeItemHeight(type)), (type === 'hours' ? 23 : 59))
        console.log(this.scrollBarHeight(type), this.typeItemHeight(type))
        this.modifyDateField(type, value)
      },

      // NOTE: used by datetime / date-range panel
      //       renamed from adjustScrollTop
      //       should try to refactory it
      adjustSpinners () {
        this.adjustSpinner('hours', this.hours - this.hourMultiple)
        this.adjustSpinner('minutes', (this.minutes - this.curMinutes) / this.minutesMultiple)
        this.adjustSpinner('seconds', this.seconds)
      },

      adjustCurrentSpinner (type) {
        let idx = 0
        switch (type) {
          case 'hours':
            idx = this[type] - this.hourMultiple
            break
          case 'minutes':
            idx = (this[type] - this.curMinutes) / this.minutesMultiple
            break
          case 'seconds':
            idx = this[type]
            break
        }
        this.adjustSpinner(type, idx)
      },

      adjustSpinner (type, value) {
        if (this.arrowControl) return
        if (!this.$refs[type]) return
        const el = this.$refs[type].wrap
        if (el) {
          el.scrollTop = Math.max(0, value * this.typeItemHeight(type))
        }
      },

      scrollDown (step) {
        if (!this.currentScrollbar) {
          this.emitSelectRange('hours')
        }

        const label = this.currentScrollbar
        const hoursList = this.hoursList
        let now = this[label]

        if (this.currentScrollbar === 'hours') {
          let total = Math.abs(step)
          step = step > 0 ? 1 : -1
          let length = hoursList.length
          while (length-- && total) {
            now = (now + step + hoursList.length) % hoursList.length
            if (hoursList[now]) {
              continue
            }
            total--
          }
          if (hoursList[now]) return
        } else {
          now = (now + step + 60) % 60
        }

        this.modifyDateField(label, now)
        this.adjustSpinner(label, now)
      },
      amPm (hour) {
        let shouldShowAmPm = this.amPmMode.toLowerCase() === 'a'
        if (!shouldShowAmPm) return ''
        let isCapital = this.amPmMode === 'A'
        let content = (hour < 12) ? ' am' : ' pm'
        if (isCapital) content = content.toUpperCase()
        return content
      },
      typeItemHeight (type) {
        return this.$refs[type].$el.querySelector('li').offsetHeight
      },
      scrollBarHeight (type) {
        return this.$refs[type].$el.offsetHeight
      }
    }
  }
</script>
<style  lang="scss">
  .ecms-time-spinner {
    .el-time-spinner__wrapper {
      .el-scrollbar__wrap {
        max-height: inherit;
        overflow-x: hidden;
      }
    }
  }
</style>
