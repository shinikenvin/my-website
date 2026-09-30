import React from 'react';
import { EXPERIENCE_DATA, SKILL_GROUPS } from '../data/portfolioData';
import { Briefcase, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 border-t border-slate-900 bg-slate-950/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-cyan-400">
            03. Thông tin cá nhân &amp; năng lực
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Về Tôi, Kinh Nghiệm &amp; Kỹ Năng Kỹ Thuật
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Hơn 4 năm gắn bó với hệ sinh thái web hiện đại, từ kiến tạo giao diện người dùng mượt mà đến xây dựng hạ tầng phân tán và tự động hóa quy trình phân phối sản phẩm.
          </p>
        </div>

        {/* 3 Core Engineering Principles Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hiệu Năng &amp; Trải Nghiệm Mượt</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mọi tương tác được tối ưu ở tần số 60 FPS, nói không với layout shift và đảm bảo điểm số Core Web Vitals luôn đạt mức tối đa.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Thiết Kế Tinh Gọn, Có Gu</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Áp dụng triết lý Zero-Pill, phối màu chuẩn 60-30-10 và phân cấp typography rõ ràng để mang lại vẻ ngoài chững chạc và chuyên nghiệp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tự Động Hóa CI/CD Chuẩn Mực</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mọi dự án đều được thiết lập pipeline tự động kiểm thử và deploy qua GitHub Actions, loại bỏ hoàn toàn các thao tác thủ công dễ sai lệch.
            </p>
          </div>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Lộ Trình Nghề Nghiệp &amp; Kinh Nghiệm
            </h3>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-10">
            {EXPERIENCE_DATA.map((exp, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

                <div className="space-y-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {exp.role}
                      </h4>
                      <div className="text-xs text-cyan-400 font-medium">
                        {exp.company} <span className="text-slate-600">·</span> {exp.location}
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-400 tabular-nums">
                      {exp.period}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>

                  <ul className="space-y-1.5 pt-1">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-cyan-400 mt-0.5">▸</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Skills tags - Zero-Pill text discipline */}
                  <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/70">
                    <span className="text-slate-300 font-medium mr-2">Công nghệ:</span>
                    <span>{exp.skills.join(' · ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Skills Matrix */}
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Bảng Phân Bổ Kỹ Năng &amp; Công Nghệ
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SKILL_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between space-y-5">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {group.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {group.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {group.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${skill.highlight ? 'text-cyan-300' : 'text-slate-300'}`}>
                          {skill.name}
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {skill.experience} · {skill.level}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            skill.highlight
                              ? 'bg-gradient-to-r from-cyan-400 to-indigo-500'
                              : 'bg-slate-500'
                          }`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
