const getLength = async(db: any) => {
  const response = await db.getBlocks();
  return response.rows.length;
}

export {
  getLength,
};
