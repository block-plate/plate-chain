import merkle from 'merkle';

const getLength = (db: any) => {
  const {blocks} = db.getBlocks();

  return blocks.rows.length;
}

export {
  getLength,
};
