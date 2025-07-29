'use client'
import {FormEvent, useState, useEffect} from 'react';

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
                <label className="border p-1 px-4">
                    Movie Title: &nbsp;
                    <input 
                        className="focus:outline-none "
                        name="title"
                        type="text"
                        value={title}
                        onChange={(e) => setMovieTitle(e.target.value)}
                        required
                    />
                </label>
            </div>
            <div className="p-1">
            </div>
            <div>
                <label className="border p-1 px-4">
                    Year of Release: &nbsp;
                    <input 
                        className="focus:outline-none w-11"
                        maxLength={4}
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
                    Amount of movies to recommend: (1-10) &nbsp;
                    <input 
                        className="border w-10 justify-center content-center text-center"
                        name="title"
                        type="number"
                        min={1}
                        max={10}
                        value={k}
                        onChange={(e) => setK(Number(e.target.value))}
                        required
                    />
                </label>
            </div>
            {/** Press enter get results */}
            <button type="submit" disabled={loading}>
            </button>
        </form>
    );
}