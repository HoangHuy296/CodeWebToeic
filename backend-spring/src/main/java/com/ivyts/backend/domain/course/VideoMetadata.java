package com.ivyts.backend.domain.course;

public class VideoMetadata {
    private String videoUrl;
    private String videoProvider;
    private Integer duration;
    private String thumbnail;

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getVideoProvider() { return videoProvider; }
    public void setVideoProvider(String videoProvider) { this.videoProvider = videoProvider; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
}
