import axios from "axios";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/analytics`;

const analysisPost = async (session: string, event: string, data: string) => {
    try {
        if (session === "") throw new Error("session is empty");
        const res = await axios.post(URL, {
            session,
            event,
            data,
        });
        return res;
    } catch (error) {
        console.error(error);
    }
};

export default analysisPost;
