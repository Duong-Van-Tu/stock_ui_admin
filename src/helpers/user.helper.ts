export const transformStockUserData = (user: any): User => ({
  id: user.id,
  username: user.username,
  fullname: user.fullname
});
