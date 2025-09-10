import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import data from './data.json';
import jsPDF from 'jspdf';

export default function TrademarkCopyrightAdvisor() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const logSearch = (kw, matched) => {
    const logs = JSON.parse(localStorage.getItem('trademark_logs') || '[]');
    logs.push({
      keyword: kw,
      time: new Date().toISOString(),
      matched: matched ? matched.关键词 : null
    });
    localStorage.setItem('trademark_logs', JSON.stringify(logs));
  };

  const handleSearch = () => {
    const match = data.find(item => keyword && item.关键词.includes(keyword));
    setResult(match || null);
    setSuggestions([]);
    logSearch(keyword, match);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (value.length > 0) {
      const filtered = data.map(d => d.关键词).filter(k => k.includes(value)).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (val) => {
    setKeyword(val);
    setSuggestions([]);
    const match = data.find(item => item.关键词 === val);
    setResult(match || null);
    logSearch(val, match);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`商标/版权推荐报告`, 20, 20);
    doc.setFontSize(12);
    doc.text(`关键词：${result.关键词}`, 20, 35);
    doc.text(`\n推荐商标类别：`, 20, 45);
    result.推荐商标类别.forEach((item, idx) => {
      doc.text(`${item.类别编号} - ${item.服务项}（${item.建议级别}）`, 25, 55 + idx * 8);
    });
    let y = 55 + result.推荐商标类别.length * 8 + 10;
    doc.text(`版权登记建议：`, 20, y);
    result.版权登记建议.forEach((item, idx) => {
      doc.text(`${item.类型}：${item.建议 ? item.说明 : '不建议'}`, 25, y + 10 + idx * 8);
    });
    doc.save(`${result.关键词}_推荐报告.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">商标 / 版权类别推荐系统</h1>
      <div className="relative mb-6">
        <div className="flex gap-2">
          <Input placeholder="请输入行业关键词" value={keyword} onChange={handleChange} />
          <Button onClick={handleSearch}>查询</Button>
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute bg-white border rounded shadow mt-1 z-10 w-full max-h-48 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <li key={idx} className="px-4 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => handleSuggestionClick(s)}>{s}</li>
            ))}
          </ul>
        )}
      </div>
      {result ? (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-2">关键词：{result.关键词}</h2>
              <Button onClick={handleExportPDF}>导出PDF报告</Button>
            </div>
            <div className="mb-4">
              <h3 className="font-bold mb-1">推荐商标类别：</h3>
              <ul className="list-disc list-inside">
                {result.推荐商标类别.map((item, idx) => (
                  <li key={idx}><strong>{item.类别编号}</strong> - {item.服务项}（{item.建议级别}）</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-1">版权登记建议：</h3>
              <ul className="list-disc list-inside">
                {result.版权登记建议.map((item, idx) => (
                  <li key={idx}>✅ {item.类型}：{item.建议 ? item.说明 : '不建议'}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500">请输入关键词后点击查询按钮查看建议</p>
      )}
    </div>
  );
}
