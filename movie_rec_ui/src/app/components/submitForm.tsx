'use client'
import {FormEvent, useState} from 'react';

// Info for the expected json format for apu
export interface Movies {
    title: string,
    year: string,
    k: number
};

// Props to pass into the form
type Props = {
    onSubmit: (values: Movies) => void;
    loading?: boolean;
}

// Our submission component
export default function SubmissionForm({
    onSubmit,
    loading = false,
}: Props) {

    // To sure title, year, k
    const [title, setMovieTitle] = useState('');
    const [year, setMovieYear] = useState('');
    const [k, setK] = useState(5);

    const handleSubmission = (e: FormEvent) => {
        e.preventDefault();
        onSubmit({title, year, k});
    };

    // Very basic submission form
    return (
        <form onSubmit={handleSubmission} style={{marginBottom: 20}}>
            <div>
                <label>
                    Title: &nbsp;
                    <input 
                        name="title"
                        type="text"
                        value={title}
                        onChange={(e) => setMovieTitle(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Year: &nbsp;
                    <input 
                        name="title"
                        type="text"
                        value={year}
                        onChange={(e) => setMovieYear(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Amount of movies to recommend: &nbsp;
                    <input 
                        name="title"
                        type="number"
                        value={k}
                        onChange={(e) => setK(Number(e.target.value))}
                        required
                    />
                </label>
            </div>
            {/** Press enter get results */}
            <button type="submit" disabled={loading}>
                {loading ? "Loading, please wait..." : "Recommended movies: "}
            </button>
        </form>
    );
}