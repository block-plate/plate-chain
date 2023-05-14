import { Router } from "express";
import qs from "qs";

const router: Router = Router();

//TODO: SDK랑 DB 따로 export 해서 router에서 사용 가능하도록 변경

// MineBlock 
router.post('/', async(req: any, res) => {
    try {
        const {data} = req.body// data === account

        if (!data) throw Error('Invalid block data.');
        const b = await req.sdk.miningBlock(data);

        if(b.isError) return res.status(500).send(b.error);

        res.json(b.value);
        
    } catch(err) {
        console.log(err);
    }
});

router.get('/', async(req: any, res) => {
    const data = qs.parse(req.query);
    const offset =  req.header('offset');
    const limit = req.header('limit');
    try{
        const blocks = await req.db.getBlocks();

        return res.json({
            blocks: blocks
        });
    }catch(err){
        console.log(err);
    }
});

router.get('/least', async(req: any, res) => {
    try{
        const block = await req.db.getLeastBlock();

        return res.json({
            block
        });
    }catch(err){
        console.log(err);
    }
});


export default router;