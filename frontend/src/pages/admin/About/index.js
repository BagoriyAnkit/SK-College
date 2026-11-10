import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../Components/Loader";
import { ViewAbout } from "../../../Service/admin/About";

export default function About() {

  const [about, setAbout] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await ViewAbout();

      if (res.data.status) {
        setAbout(res.data.data);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>

      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold text-slate-800">
            About Details
          </h2>

          <Link
            to={
              about?._id
                ? `/admin/about/edit/${about._id}`
                : "/admin/about/add"
            }
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl"
          >
            {about?._id ? "Edit About" : "Add About"}
          </Link>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          {loading ? (
            <Loader />
          ) : (
            <>

              <p>
                <strong>Title :</strong> {about?.title}
              </p>

              <br />

              <p>
                <strong>Description :</strong>
                <br />
                {about?.description}
              </p>

              <br />

              <p>
                <strong>Vision :</strong>
                <br />
                {about?.vision}
              </p>

              <br />

              <p>
                <strong>Mission :</strong>
                <br />
                {about?.mission}
              </p>

              <br />

              {about?.image && (
                <img
                  src={`http://localhost:4000/uploads/${about.image}`}
                  alt="About"
                  className="w-52 rounded-lg border"
                />
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}