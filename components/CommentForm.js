import { useForm } from 'react-hook-form';

const CommentForm = ({ onSubmit, identifier }) => {
    const { register, handleSubmit, reset } = useForm();

    const handleFormSubmit = (data) => {
        onSubmit(identifier, data);
        reset();
    };

    return (
        <form
            className="form-container more-width"
            onSubmit={handleSubmit(handleFormSubmit)}
            id={identifier}
        >
            <input
                type="text"
                {...register(`${identifier}commentText`)}
                placeholder="Comment"
            />
            <div className="submit">
                <button type="submit">Submit</button>
            </div>
        </form>
    );
};

export default CommentForm;
