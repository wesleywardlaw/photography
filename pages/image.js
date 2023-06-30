import { useRouter } from 'next/router';

const ImagePage = () => {
    const router = useRouter();
    const { imageUrl } = router.query;

    return <div>{imageUrl && <img src={imageUrl} alt="Image" />}</div>;
};

export default ImagePage;
