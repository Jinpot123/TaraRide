import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

// Static TaraRide news
const staticNewsData = [
  {
    title: "New Feature: Real-Time Driver Location",
    date: "April 12, 2025",
    category: "App Update",
    description:
      "We’ve added real-time driver tracking! Passengers can now see their driver’s location on the map.",
  },
  {
    title: "TaraRide Expands to Metro Manila!",
    date: "April 10, 2025",
    category: "News Update",
    description:
      "TaraRide is now available for commuters in Metro Manila! Enjoy convenient and affordable carpooling today.",
  },
];

const News = () => {
  const [apiNews, setApiNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrafficNews = async () => {
      try {
        const response = await axios.get(
          `https://newsdata.io/api/1/news?apikey=pub_8365260f68540a538d106e6ad18477d1cf144&q=philippine%20traffic%20news&country=ph`
        );

        const formattedApiNews = response.data.results.map((item) => ({
          title: item.title,
          date: item.pubDate
            ? new Date(item.pubDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "No Date",
          category: "Traffic News",
          description:
            item.description && item.description.length > 150
              ? item.description.slice(0, 150) + "..."
              : item.description || "No Description Available",
          link: item.link || null, // Add the link here
        }));

        setApiNews(formattedApiNews);
      } catch (error) {
        console.error("Failed to fetch traffic news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficNews();
  }, []);

  const combinedNews = [...staticNewsData, ...apiNews].slice(0, 3);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <section id="news" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Latest News & Updates
        </h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          Stay informed with TaraRide
        </p>

        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {combinedNews.map((news, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105 flex flex-col justify-between min-h-[320px]"
            >
              <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                {news.category}
              </span>
              <h3 className="mt-4 text-2xl font-semibold text-gray-900">
                {news.title}
              </h3>
              <p className="mt-4 text-gray-700 text-sm line-clamp-4">
                {news.description}
              </p>
              {news.link && (
                <a
                  href={news.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm mt-3 inline-block hover:underline"
                >
                  Read More →
                </a>
              )}
              <p className="mt-6 text-gray-500 text-xs">{news.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
