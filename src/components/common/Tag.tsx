"use client";

import './tag.css';

import { useMemo } from 'react';


type Props = {
  color: 'red' | 'green' | 'blue' | 'purple';
  text: string;
};

export default function Tag({ color, text }: Props) {
  return (
    <span className={"tag " + color}>{text}</span>
  )
}