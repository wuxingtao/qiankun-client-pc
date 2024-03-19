import { getUserSetting, setUserSetting } from '@/utils/storage'

const PAGE_SIZE = 'userPageSize'

class UserSetting {
  constructor() {}

  async getUserPageSize() {
    const pageSize = await getUserSetting(PAGE_SIZE)
    return pageSize
  }

  setUserPageSize(pageSize) {
    setUserSetting(PAGE_SIZE, pageSize)
  }
}

export default new UserSetting()
